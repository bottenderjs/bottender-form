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
  shouldStop = alwaysFalse,
  steps,
  retryMessage = RETRY_MESSAGE,
  retryTimes = 3,
} = {}) => async (context, next) => {
  const { $form } = context.state;

  if (!$form) {
    if (shouldStart(context)) {
      if (typeof steps[0].question === 'function') {
        await steps[0].question(context);
      } else {
        await context.sendText(steps[0].question);
      }
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

  if (shouldStop(context)) return;

  if ($form.name !== name) return next();

  const step = steps[$form.index];

  const shouldRetry =
    !context.event.isText ||
    (step.validation &&
      !await Promise.resolve(step.validation(context.event.text)));

  if (shouldRetry) {
    const retry = ($form.retry || 0) + 1;
    if (retry === retryTimes) {
      context.setState({
        $form: null,
      });
      return;
    }
    await context.sendText(retryMessage);
    if (typeof step.question === 'function') {
      await step.question(context);
    } else {
      await context.sendText(step.question);
    }
    context.setState({
      $form: {
        ...$form,
        retry,
      },
    });
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
    if (typeof steps[nextIndex].question === 'function') {
      await steps[nextIndex].question(context);
    } else {
      await context.sendText(steps[nextIndex].question);
    }
    context.setState({
      $form: {
        ...$form,
        index: nextIndex,
      },
    });
  }
};
