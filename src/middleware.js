import { channel as createChannel } from 'redux-saga';
import { isHistoryAction, isIntercepted } from './actions';

export default function createMiddleware() {
  const channel = createChannel();
  const middleware = store => next => action => {
    if (isHistoryAction(action) && !isIntercepted(action)) {
      console.log('intercepted', action);
      channel.put(action);
      return;
    }
    return next(action);
  };
  middleware.channel = channel;
  return middleware;
}
