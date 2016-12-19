import { eventChannel } from 'redux-saga';
import { call, fork, put, select, take } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import {
  unprefix, init, changeComponent, updatePathInfo,
  PUSH, REPLACE, GO, GO_BACK, GO_FORWARD
} from './actions';
import { parseQueryString, normOffset, removeOffset, toCamelCase } from './utils';

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

// offset: normalized offset
function createHandler(matcher, offset) {
  return function* handler(location) {
    const pathname = removeOffset(location.pathname, offset);
    const matched = matcher.match(pathname);
    if (matched) {
      const { action, params, route, splats } = matched;
      const info = {
        path: pathname,
        params,
        query: parseQueryString(location.search),
        splats,
        route,
      };
      yield put(updatePathInfo(info));
      yield call(action, info);
    } else {
      console.error(`No matched route: ${pathname} (original='${location.pathname}', offset='${offset}')`);
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

function* handleLocationChange({ history, routes, initial }) {
  // Use initial path as offset
  const offset = normOffset(history.location.pathname);

  // Set initial state
  yield put(init({ page: initial, offset }));

  const channel = createLocationChannel(history);
  const handler = createHandler(prepareMatcher(preprocess(routes)), offset);

  // Initialize with the current location
  yield call(handler, history.location);

  while (true) {
    const { location } = yield take(channel);
    yield call(handler, location);
  }
}

function* handleHistoryAction({ history }) {
  while (true) {
    const { type, payload } = yield take([PUSH, REPLACE, GO, GO_BACK, GO_FORWARD]);

    if (type === PUSH || type === REPLACE) {
      // Prepend offset to path at first argument in payload
      const { offset } = yield select(state => state.router);
      if (offset) {
        payload[0] = offset + payload[0];
      }
    }

    history[toCamelCase(unprefix(type))](...payload);
  }
}

export default function* routerSaga(options) {
  yield fork(handleLocationChange, options);
  yield fork(handleHistoryAction, options);
}
