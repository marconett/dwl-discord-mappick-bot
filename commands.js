const commands = [];

commands.push({
  name: 'pick',
  description: 'Start pick/ban map selection for a DWL match.',
  options: [
    {
      type: 6,
      name: 'opponent',
      description: 'Who to pick/ban with.',
      required: true
    }
  ],
});

export default commands;