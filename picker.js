import Session from './Session.js';
import store from './store.js';
import {
  MAPS,
  PICK_BAN_ORDER_3,
  PICK_BAN_ORDER_5,
  PICK_BAN_ORDER_7,
  WINNER_LOSER_ORDER_3,
  WINNER_LOSER_ORDER_5,
  WINNER_LOSER_ORDER_7,
} from './constants.js';

export async function firstStep(interaction, bo) {
  let startingpickBanType = PICK_BAN_ORDER_3[0]
  let startingUserType = WINNER_LOSER_ORDER_3[0]

  if (bo === 5) {
    startingpickBanType = PICK_BAN_ORDER_5[0]
    startingUserType = WINNER_LOSER_ORDER_5[0]
  }

  if (bo === 7) {
    startingpickBanType = PICK_BAN_ORDER_7[0]
    startingUserType = WINNER_LOSER_ORDER_7[0]
  }

  const startingUser = interaction.user
  const opponentUser = interaction.options.getUser('opponent')
  let winningUser = startingUser
  let losingUser = opponentUser
  let initialMessage

  if (opponentUser.id === startingUser.id || opponentUser.bot) {
    await interaction.reply({ content: 'You can\'t pick maps with yourself or a bot.', ephemeral: true })
    return
  }

  // bo7 works differently: no coin toss
  if (bo === 7) {
    const foundSession = store.sessions.find(session => (session.step !== 9 && (session.winner.id === startingUser.id) && (session.loser.id === opponentUser.id)))

    if (foundSession) {
      await interaction.reply({ content: 'There\'s already an open pick/ban process between you two.', ephemeral: true })
      return
    }
    initialMessage = await interaction.reply({ content: `${winningUser} started the pick process, so they are assumed to be the **upper bracket winner**. If this is incorrect, please restart the picking process.`, fetchReply: true });
  } else {
    const foundSession = store.sessions.find(session => {
      // if the session is not done AND there's no session between the users with the selected bo
      return (session.step !== 9 && (((session.winner.id === startingUser.id || session.winner.id === opponentUser.id) && (session.loser.id === startingUser.id || session.loser.id === opponentUser.id)) && session.bo === bo))
    })

    if (foundSession) {
      await interaction.reply({ content: 'There\'s already an open pick/ban process between you two.', ephemeral: true })
      return
    }

    if (Math.random() < 0.5) {
      winningUser = opponentUser
      losingUser = startingUser
    }

    initialMessage = await interaction.reply({ content: `${winningUser} **won** the coin toss!`, fetchReply: true });
  }

  const thread = await initialMessage.startThread({
    name: `BO${bo}: ${startingUser.username}'s team vs ${opponentUser.username}'s team`,
    reason: 'Picking maps for a DWL group match',
    autoArchiveDuration: 60,
  });

  await thread.members.add(winningUser.id);
  await thread.members.add(losingUser.id);

  const session = new Session(thread, winningUser, losingUser, bo)
  store.sessions.push(session)

  const firstMsgUser = (startingUserType === 'winner') ? winningUser : losingUser
  await thread.send({ content: `${firstMsgUser}, please **${startingpickBanType}** a map:`, components: session.getCurrentButtons() });
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

    let bo7Notice = ''

    if (foundSession.bo === 7) {
      bo7Notice = `Grand Finals start with a 1-0 score advantage for the upper bracket winners.\n`
    }

    if (foundSession.remainingMaps.length === 0) {
      const mapsString = foundSession.picks.map((m, i) => (i+1).toString() + '. ' + m['name']).join('\n')
      await foundSession.thread.send({ content: `\n**Maps to play:\n------\n${mapsString}\n------**\n${bo7Notice}Please post the lobby key into this thread.\n\n**After the match: Winner needs to report result in #match-ids channel.**\n\n*GL HF*` })
    } else {
      await foundSession.thread.send({ content: `${foundSession.getCurrentPlayer()}, please **${foundSession.getCurrentPickBanString()}** a map:`, components: foundSession.getCurrentButtons() })
    }
  } catch (e) {
    interaction.deferUpdate()
  }
};