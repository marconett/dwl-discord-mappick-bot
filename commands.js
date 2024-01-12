const commands = [];

commands.push(
  {
    name: 'pick',
    description: 'Start BO1 pick/ban map selection.',
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
    name: 'pick1',
    description: 'Start BO1 pick/ban map selection.',
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
    description: 'Start BO3 pick/ban map selection',
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
    description: 'Start BO5 pick/ban map selection.',
    options: [
      {
        type: 6,
        name: 'opponent',
        description: 'Who to pick/ban with.',
        required: true
      }
    ],
  },
);

export default commands;