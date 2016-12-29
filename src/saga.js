import { eventChannel, buffers } from 'redux-saga';
import { call, fork, put, select, take, race } from 'redux-saga/effects';
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

// https://redux-saga.github.io/redux-saga/docs/api/index.html#blocking--nonblocking
const EFFECT_TYPES = ['TAKE', 'CALL', 'APPLY', 'CPS', 'JOIN', 'CANCEL', 'FLUSH', 'CANCELLED', 'RACE'];
function isBlockEffect(effect) {
  return EFFECT_TYPES.map(type => !!effect[type]).reduce((p, c) => p || c, false);
}

function* runHook(iterator) {
  let ret;
  while (true) {
    const { value: effect, done } = iterator.next(ret);
    if (done) break;

    if (effect === false) {
      console.log('prevented');
      return false; // Prevented
    }

    console.log('effect', effect);
    ret = yield effect;
  }

  return true; // Not prevented
}

function* nextLocation(channels, hooks) {
  let { browser, middleware } = yield takeFromChannels(channels), location;
  if (browser) {
    location = browser.location;
    console.log('location[browser]', location.pathname, browser.action);
    console.log('SKIP: leave hooks', hooks);
  } else {
    // Run leave hooks
    for (const hook of hooks) {
      console.log('fn[leave]', hook);
      if (!(yield call(runHook, hook()))) {
        return; // Prevented
      }
    }

    const action = intercepted(middleware);
    yield put(action);

    // Take location change from browser
    const change = yield take(channels.browser);
    location = change.location;
    console.log('location[middleware]', location.pathname, change.action);
  }

  return location; // Not prevented
}

// offset: normalized offset
function* theControlTower({ history, matcher, offset, cancel, channels }) {
  // FIXME: Initial location
  yield put(push(removeOffset(history.location.pathname, offset)));

  let hooks = [], location;
  while (true) {
    if (!location) {
      location = yield call(nextLocation, channels, hooks);
      if (!location) continue; // Prevented by leave hooks
    }

    const pathname = removeOffset(location.pathname, offset);
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
      query: parseQueryString(location.search),
      splats,
      route,
    };

    yield put(updatePathInfo(args));

    // Clear for detecting location change while running action
    location = undefined;

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

        console.log('effect', effect, isBlockEffect(effect));
        if (isBlockEffect(effect)) {
          const { main, loc } = yield race({
            main: effect,
            loc: call(nextLocation, channels, []) // Passing leave hooks or not?
          });
          if (main) {
            ret = main;
          } else if (loc) {
            console.log('cancel', loc);

            // Run cancel hook
            // No need to check return value
            yield call(runHook, cancel());

            // Location {is|will be} changed
            // Use this location in next iteration
            location = loc;

            break; // GOTO: Outermost while-loop
          } else {
            // NOOP...?
          }
        } else {
          ret = yield effect;
        }
      }

      // GOTO: Outermost while-loop
      if (location) break;
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
