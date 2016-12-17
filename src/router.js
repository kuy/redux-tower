import { eventChannel } from 'redux-saga';
import { take, call } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import qs from 'querystring';

function prepareMatcher(routes) {
  const matcher = ruta3();
  for (const path of Object.keys(routes)) {
    const action = routes[path];
    matcher.addRoute(path, action);
  }
  return matcher;
}

function createLocationChannel(history) {
  return eventChannel(emit => {
    const unlisten = history.listen((location, action) => {
      emit({ location, action });
    });
    return unlisten;
  });
}

function parse(search) {
  if (search.indexOf('?') === 0) {
    search = search.slice(1);
  }
  return qs.parse(search);
}

function createHandler(matcher) {
  return function* handler(location) {
    console.log('handler', matcher);
    const { action, params, route, splats } = matcher.match(location.pathname);
    yield call(action, { params, splats, route, query: parse(location.search) });
  }
}

export default function* router(history, routes) {
  const channel = createLocationChannel(history);
  const handler = createHandler(prepareMatcher(routes));

  // Current path
  yield call(handler, history.location);

  while (true) {
    const { location } = yield take(channel);
    console.log('changed', location);
    yield call(handler, location);
  }
}
