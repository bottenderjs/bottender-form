const { MessengerBot, middleware } = require('bottender');
const { createServer } = require('bottender/express');
const form = require('bottender-form');
const range = require('lodash/range');

const config = require('./bottender.config').messenger;

const bot = new MessengerBot({
  accessToken: config.accessToken,
  appSecret: config.appSecret,
});

const handleForm = form({
  name: 'user',
  shouldStart: context => context.event.text === '/form',
  didFinish: async context => {
    await context.sendText('OK!');
  },
  steps: [
    {
      question: async context => {
        await context.sendText('Which color do you like?', {
          quick_replies: [
            {
              content_type: 'text',
              title: 'Red',
              payload: 'red',
            },
            {
              content_type: 'text',
              title: 'Blue',
              payload: 'blue',
            },
          ],
        });
      },
      validation: text => /(red|blue)/i.test(text),
      map: text => text.toLowerCase(),
      stateKey: 'user.color',
    },
    {
      question: async context => {
        await context.sendText('How old are you?', {
          quick_replies: range(20, 30).map(i => ({
            content_type: 'text',
            title: `${i}`,
            payload: `${i}`,
          })),
        });
      },
      validation: text => /\d+/.test(text),
      map: numstr => +numstr,
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

const server = createServer(bot, { verifyToken: config.verifyToken });

server.listen(5000, () => {
  console.log('server is running on 5000 port...');
});
