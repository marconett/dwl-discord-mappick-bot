import { Client, GatewayIntentBits, REST, Routes } from 'discord.js'
import { SECRET } from './config.js'
import Commands from './commands.js'
import { firstStep, subsequentSteps } from './picker.js'
import { ALLOWED_CHANNELS } from './constants.js'

async function initCommands() {
  const rest = new REST({ version: '10' }).setToken(SECRET.token)

  try {
    // delete all existing global commands
    await rest.put(Routes.applicationCommands(SECRET.clientId), { body: [] })
    console.log('Successfully deleted all application commands.')

    // create global commands
    await rest.put(Routes.applicationCommands(SECRET.clientId), { body: Commands })
    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.warn(error)
  }
}

async function init() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  });

  client.on('interactionCreate', async (interaction) => {

    if (interaction.isButton()) {
      await subsequentSteps(interaction)
      return
    }

    if (interaction.isChatInputCommand()) {
      if (!ALLOWED_CHANNELS.includes(interaction.channel.id)) {
        await interaction.reply({ content: 'Not allowed in this channel, this bot only works in #match-lobby channels.', ephemeral: true })
        return
      }

      if (interaction.commandName === 'pick' || interaction.commandName === 'pick1' || interaction.commandName === 'pick3' || interaction.commandName === 'pick5') {
        let bo = 1
        if (interaction.commandName === 'pick3') bo = 3
        if (interaction.commandName === 'pick5') bo = 5

        try {
          await firstStep(interaction, bo)
          } catch (error) {
            console.warn(error);
          }
      } else {
        await interaction.reply({ content: 'Unknown command.', ephemeral: true })
      }
    }

    return
  });

  client.login(SECRET.token)
}


async function main() {
  // only needed if we added, changed or removed the
  // name or description of a command
  if (process.argv.slice(2)[0] === '--fresh') {
    await initCommands()
  }

  await init()
}

main()