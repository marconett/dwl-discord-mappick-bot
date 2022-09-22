const commands = [];

commands.push({
  name: 'pick',
  description: 'start pick/ban map selection for a DWL match',
  options: [
    {
      type: 6,
      name: 'opponent',
      description: 'who to pick/ban with',
      required: true
    }
  ],
});

export default commands;