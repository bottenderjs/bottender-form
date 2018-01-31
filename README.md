# bottender-form

[![npm](https://img.shields.io/npm/v/bottender-form.svg?style=flat-square)](https://www.npmjs.com/package/bottender-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> An experimental package for handling conversational form with [Bottender](https://github.com/Yoctol/bottender).

## Installation

```sh
npm install bottender-form
```

## Usage

```js
const { middleware } = require('bottender');
const form = require('bottender-form');

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
```

## Options

### name

`text`

### shouldStart

Default: `() => false`.

### shouldStop

Default: `() => false`.

### retryMessage

Default: `Validation failed. Please try again.`.

### retryTimes

Default: `3`.

### Step

#### question

`text`

#### stateKey

`text`

#### validation

`text => boolean | async text => boolean`

#### map

`text => any`

## License

MIT © [Yoctol](https://github.com/bottenderjs/bottender-form)
