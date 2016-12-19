import { eventChannel } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import qs from 'querystring';
import { initComponent, changeComponent, updatePathInfo } from './actions';

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
    const matched = matcher.match(location.pathname);
    if (matched) {
      const { action, params, route, splats } = matched;
      const info = {
        path: location.pathname,
        params,
        query: parse(location.search),
        splats,
        route,
      };
      yield put(updatePathInfo(info));
      yield call(action, info);
    } else {
      console.error(`No route matched: ${location.pathname}`);
    }
  }
}

function createRouteAction(Component) {
  const name = `generated${Component.displayName || 'Unknown'}Component`;
  const action = {
    [name]: function* () {
      yield put(changeComponent(Component));
    }
  };
  return action[name];
}

function preprocess(routes) {
  for (const path of Object.keys(routes)) {
    const value = routes[path];

    // Resolve redirect/alias
    if (typeof value === 'string') {
      routes[path] = routes[value];
    }

    // Resolve React component
    if (value.prototype && typeof value.prototype.isReactComponent !== 'undefined') {
      routes[path] = createRouteAction(value);
    }
  }

  return routes;
}

export default function* towerSaga(history, routes, initial) {
  // Set initial component
  yield put(initComponent(initial));

  const channel = createLocationChannel(history);
  const handler = createHandler(prepareMatcher(preprocess(routes)));

  // Initialize with the current location
  yield call(handler, history.location);

  while (true) {
    const { location } = yield take(channel);
    yield call(handler, location);
  }
}
