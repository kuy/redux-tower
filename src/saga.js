import { eventChannel, takeLatest, buffers } from 'redux-saga';
import { call, fork, put, select, take, race, cancelled } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import {
  intercepted, unprefix, init, updatePathInfo, push,
  PUSH, REPLACE, HISTORY_ACTIONS
} from './actions';
import { parseQueryString, normOffset, removeOffset, toCamelCase } from './utils';
import preprocess from './preprocess';

function createMatcher(routes) {
  routes = preprocess(routes);
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
  }, buffers.expanding());
}

function takeFromChannels(channels) {
  return race(
    Object.keys(channels)
      .map(name => ([name, channels[name]]))
      .reduce((prev, [name, ch]) => ({ ...prev, [name]: take(ch) }), {})
  );
}

// TODO: handle cancelling
// offset: normalized offset
function* theControlTower({ history, matcher, offset, cancel, channels }) {
  // FIXME: Initial location
  yield put(push(removeOffset(history.location.pathname, offset)));

  let hooks = [];
  while (true) {
    let { browser, middleware } = yield takeFromChannels(channels), prevented = false, loc;
    if (browser) {
      loc = browser.location;
      console.log('loc[browser]', loc.pathname, browser.action);
      console.log('SKIP: leave hooks', hooks);
    } else {
      for (const fn of hooks) {
        console.log('fn[leave]', fn);
        let ret;
        const iterator = fn();
        while (true) {
          const { value: effect, done } = iterator.next(ret);
          if (done) break;

          if (effect === false) {
            console.log('prevented');
            prevented = true;
            break;
          }

          console.log('effect', effect);
          ret = yield effect;
        }

        if (prevented) break;
      }

      if (prevented) continue;

      const action = intercepted(middleware);
      yield put(action);

      // Take location change from browser
      const change = yield take(channels.browser);
      loc = change.location;
      console.log('loc[middleware]', loc.pathname, change.action);
    }

    const pathname = removeOffset(loc.pathname, offset);
    const matched = matcher.match(pathname);
    if (!matched) {
      console.error(`No matched route: ${pathname} (original='${location.pathname}', offset='${offset}')`);
      continue;
    }

    console.log('matched', matched);

    const { action: actions, params, route, splats } = matched;
    console.log('actions', actions);
    const args = {
      path: pathname,
      params,
      query: parseQueryString(loc.search),
      splats,
      route,
    };

    yield put(updatePathInfo(args));

    const [enter, action, leave] = actions;
    hooks = leave;

    for (const fn of [...enter, action]) {
      let ret, iterator;
      if (fn === action) {
        console.log('fn[action]', fn);
        iterator = fn(args);
      } else {
        console.log('fn[enter]', fn);
        iterator = fn();
      }
      while (true) {
        const { value: effect, done } = iterator.next(ret);
        if (done) break;
        console.log('effect', effect);
        ret = yield effect;
      }
    }
  }
}

function* handleLocationChange({ history, routes, initial, cancel, channels }) {
  // FIXME: Use initial path as offset
  const offset = normOffset(history.location.pathname);

  // Prepare initial state
  yield put(init({ component: initial, offset }));

  // Start routing
  const matcher = createMatcher(routes);
  channels = { ...channels, browser: createLocationChannel(history) };
  yield fork(theControlTower, { history, matcher, offset, cancel, channels });
}

function* handleHistoryAction({ history }) {
  while (true) {
    const { type, payload } = yield take(HISTORY_ACTIONS);

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
