const { ConsoleBot, middleware } = require('bottender');
const form = require('bottender-form');

const bot = new ConsoleBot();

const handleForm = form({
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
      stateKey: 'user.age',
    },
  ],
});

bot.onEvent(
  middleware([
    handleForm,
    async context => {
      if (context.event.isMessage) {
        await context.sendText(`user: ${JSON.stringify(context.state.user)}`);
      }
    },
  ])
);

bot.createRuntime();
