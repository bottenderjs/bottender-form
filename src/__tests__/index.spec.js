const form = require('../');

function setup(options = {}) {
  return {
    handler: form({
      name: 'user',
      shouldStart: context => context.event.text === '/form',
      steps: [
        {
          question: "What's your name?",
          stateKey: 'user.name',
        },
        {
          question: 'How old are you?',
          validation: text => /\d+/.test(text),
          map: numstr => +numstr,
          stateKey: 'user.age',
        },
      ],
      ...options,
    }),
    next: jest.fn(),
  };
}

it('should be exported', () => {
  expect(form).toBeDefined();
});

it('should call next when should not start', async () => {
  const { handler, next } = setup();

  const context = {
    state: {},
    event: {
      isText: true,
      text: 'haha',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(next).toBeCalled();
});

it('should call next when form not match', async () => {
  const { handler, next } = setup();

  const context = {
    state: {
      $form: {
        name: 'xxx',
      },
    },
    event: {
      isText: true,
      text: '/form',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(next).toBeCalled();
});

it('should send first question and set state when should start', async () => {
  const { handler, next } = setup();

  const context = {
    state: {},
    event: {
      isText: true,
      text: '/form',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(context.setState).toBeCalledWith({
    $form: { name: 'user', index: 0 },
  });
  expect(context.sendText).toBeCalledWith("What's your name?");

  expect(next).not.toBeCalled();
});

it('should send second question and set state when receiving first anwser', async () => {
  const { handler, next } = setup();

  const context = {
    state: {
      $form: { name: 'user', index: 0 },
    },
    event: {
      isText: true,
      text: 'myname',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(context.setState).toBeCalledWith({
    $form: { name: 'user', index: 0 },
    user: {
      name: 'myname',
    },
  });
  expect(context.setState).toBeCalledWith({
    $form: { name: 'user', index: 1 },
  });

  expect(context.sendText).toBeCalledWith('How old are you?');

  expect(next).not.toBeCalled();
});

it('should set state when receiving second anwser', async () => {
  const { handler, next } = setup();

  const context = {
    state: {
      $form: { name: 'user', index: 1 },
      user: {
        name: 'myname',
      },
    },
    event: {
      isText: true,
      text: '18',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(context.setState).toBeCalledWith({
    $form: { name: 'user', index: 1 },
    user: {
      name: 'myname',
      age: 18,
    },
  });
  expect(context.setState).toBeCalledWith({
    $form: null,
  });

  expect(context.sendText).not.toBeCalled();

  expect(next).not.toBeCalled();
});

it('should retry when receiving wrong anwser', async () => {
  const { handler, next } = setup();

  const context = {
    state: {
      $form: { name: 'user', index: 1 },
      user: {
        name: 'myname',
      },
    },
    event: {
      isText: true,
      text: 'wrong',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(context.sendText).toBeCalledWith(
    'Validation failed. Please try again.'
  );
  expect(context.sendText).toBeCalledWith('How old are you?');

  expect(next).not.toBeCalled();
});

it('should retry when receiving wrong anwser', async () => {
  const { handler, next } = setup({ retryMessage: 'Oh no....' });

  const context = {
    state: {
      $form: { name: 'user', index: 1 },
      user: {
        name: 'myname',
      },
    },
    event: {
      isText: true,
      text: 'wrong',
    },
    setState: jest.fn(),
    sendText: jest.fn(),
  };

  await handler(context, next);

  expect(context.sendText).toBeCalledWith('Oh no....');
  expect(context.sendText).toBeCalledWith('How old are you?');

  expect(next).not.toBeCalled();
});
