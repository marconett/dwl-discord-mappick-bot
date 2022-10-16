import Session from './Session.js';
import store from './store.js';
import { MAPS } from './constants.js';

export async function firstStep(interaction) {
  const startingUser = interaction.user
  const opponentUser = interaction.options.getUser('opponent')

  if (opponentUser.id === startingUser.id || opponentUser.bot) {
    await interaction.reply({ content: 'You can\'t pick maps with yourself or a bot.', ephemeral: true })
    return
  }

  const foundSession = store.sessions.find(session => (session.step !== 9 && (session.winner.id === startingUser.id || session.winner.id === opponentUser.id) && (session.loser.id === startingUser.id || session.loser.id === opponentUser.id)))

  if (foundSession) {
    await interaction.reply({ content: 'There\'s already an open pick/ban process between you two.', ephemeral: true })
    return
  }

  let winningUser = startingUser
  let losingUser = opponentUser

  if (Math.random() < 0.5) {
    winningUser = opponentUser
    losingUser = startingUser
  }

  const initialMessage = await interaction.reply({ content: `${winningUser} **won** the coin toss!`, fetchReply: true });

  const thread = await initialMessage.startThread({
    name: `${startingUser.username}'s team vs ${opponentUser.username}'s team`,
    reason: 'Picking maps for a DWL group match',
    autoArchiveDuration: 60,
  });

  await thread.members.add(winningUser.id);
  await thread.members.add(losingUser.id);

  const session = new Session(thread, winningUser, losingUser)
  store.sessions.push(session)

  await thread.send({ content: `${losingUser}, please **ban** a map:`, components: session.getCurrentButtons() });
}


export async function subsequentSteps(interaction) {
  try {
    const data = JSON.parse(interaction.customId)

    if (interaction.user.id !== data.uid) {
      await interaction.reply({ content: 'It\'s not your turn ...', ephemeral: true })
      return
    }

    const foundMap = MAPS.find(map => map.id === data.mid)
    const foundSession = store.sessions.find(session => session.id === data.id)
    const typeString = (foundSession.getCurrentPickBanString() === 'pick') ? 'picked' : 'banned'

    foundSession.pickBan(data.mid)

    interaction.message.delete()

    await foundSession.thread.send({ content: `${interaction.user} ${typeString} **${foundMap.name}**` })

    // console.log(foundSession)

    if (foundSession.remainingMaps.length === 0) {
      const mapsString = foundSession.picks.map((m, i) => (i+1).toString() + '. ' + m['name']).join('\n')
      await foundSession.thread.send({ content: `\n**Maps to play:\n------\n${mapsString}\n------**\nPlease post the lobby key into this thread.\n*GL HF*` })
    } else {
      await foundSession.thread.send({ content: `${foundSession.getCurrentPlayer()}, please **${foundSession.getCurrentPickBanString()}** a map:`, components: foundSession.getCurrentButtons() })
    }
  } catch (e) {
    interaction.deferUpdate()
  }
};