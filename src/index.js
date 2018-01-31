// const step = {
//   question:
//   validation:
//   stateKey:
// }

const set = require('lodash/set');

const alwaysFalse = () => false;
const RETRY_MESSAGE = 'Validation failed. Please try again.';

module.exports = ({
  name,
  shouldStart = alwaysFalse,
  steps,
  retryMessage = RETRY_MESSAGE,
} = {}) => async (context, next) => {
  const { $form } = context.state;

  if (!$form) {
    if (shouldStart(context)) {
      await context.sendText(steps[0].question);
      context.setState({
        $form: {
          name,
          index: 0,
        },
      });
      return;
    }
    return next();
  }
  if ($form.name !== name) return next();

  const step = steps[$form.index];

  if (!context.event.isText) {
    await context.sendText(retryMessage);
    await context.sendText(step.question);
    return;
  }

  if (
    step.validation &&
    !await Promise.resolve(step.validation(context.event.text))
  ) {
    await context.sendText(retryMessage);
    await context.sendText(step.question);
    return;
  }

  const map = step.map || (val => val);

  context.setState({
    ...set(context.state, step.stateKey, map(context.event.text)),
  });

  if ($form.index === steps.length - 1) {
    context.setState({
      $form: null,
    });
  } else {
    const nextIndex = $form.index + 1;
    await context.sendText(steps[nextIndex].question);
    context.setState({
      $form: {
        ...$form,
        index: nextIndex,
      },
    });
  }
};
