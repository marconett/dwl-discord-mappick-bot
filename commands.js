const commands = [];

commands.push(
  {
    name: 'pick',
    description: 'Start BO3 pick/ban map selection for a DWL match.',
    options: [
      {
        type: 6,
        name: 'opponent',
        description: 'Who to pick/ban with.',
        required: true
      }
    ],
  },
  {
    name: 'pick3',
    description: 'Start BO3 pick/ban map selection for a DWL match.',
    options: [
      {
        type: 6,
        name: 'opponent',
        description: 'Who to pick/ban with.',
        required: true
      }
    ],
  },
  {
    name: 'pick5',
    description: 'Start BO5 pick/ban map selection for DWL playoffs.',
    options: [
      {
        type: 6,
        name: 'opponent',
        description: 'Who to pick/ban with.',
        required: true
      }
    ],
  },
  {
    name: 'pick7',
    description: 'Start BO7 pick/ban map selection for Grand Finals. Only for the upper bracket winner!',
    options: [
      {
        type: 6,
        name: 'opponent',
        description: 'The Lower bracket winner.',
        required: true
      }
    ],
  },
);

export default commands;