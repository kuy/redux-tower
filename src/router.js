import { eventChannel } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import qs from 'querystring';

export const CHANGE_PAGE = 'CHANGE_PAGE';
export const changePage = payload => ({ type: CHANGE_PAGE, payload });

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
      yield call(action, { params, splats, route, query: parse(location.search) });
    } else {
      console.error(`No route matched`);
    }
  }
}

function createRouteAction(Page) {
  const name = `action${Page.displayName || 'UnknownPage'}`;
  const action = {
    [name]: function* () {
      yield put(changePage(Page));
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

export default function* router(history, routes) {
  const channel = createLocationChannel(history);
  const handler = createHandler(prepareMatcher(preprocess(routes)));

  // Initialize with the current location
  yield call(handler, history.location);

  while (true) {
    const { location } = yield take(channel);
    console.log('changed', location);
    yield call(handler, location);
  }
}
