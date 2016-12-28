import { eventChannel, takeLatest } from 'redux-saga';
import { call, fork, put, select, take, cancelled } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import {
  unprefix, init, updatePathInfo,
  PUSH, REPLACE, GO, GO_BACK, GO_FORWARD
} from './actions';
import { parseQueryString, normOffset, removeOffset, toCamelCase } from './utils';
import preprocess from './preprocess';

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
function createHandler(matcher, offset, cancel) {
  return function* handler({ location, action }) {
    // TODO: Handle 'action' argument
    const pathname = removeOffset(location.pathname, offset);
    const matched = matcher.match(pathname);
    if (matched) {
      const { action: actions, params, route, splats } = matched;
      console.log('actions', actions);
      const args = {
        path: pathname,
        params,
        query: parseQueryString(location.search),
        splats,
        route,
      };

      yield put(updatePathInfo(args));

      try {
        const [enter, action, leave] = actions;
        yield call(action, args);
      } finally {
        if (typeof cancel === 'function' && (yield cancelled())) {
          yield call(cancel);
        }
      }
    } else {
      console.error(`No matched route: ${pathname} (original='${location.pathname}', offset='${offset}')`);
    }
  }
}

function* handleLocationChange({ history, routes, initial, cancel }) {
  // Use initial path as offset
  const offset = normOffset(history.location.pathname);

  // Set initial state
  yield put(init({ page: initial, offset }));

  const location = createLocationChannel(history);
  const handler = createHandler(prepareMatcher(preprocess(routes)), offset, cancel);

  // Initialize with the current location
  yield call(handler, { location: history.location });

  // Start routing
  yield takeLatest(location, handler);
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
