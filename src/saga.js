import { eventChannel, buffers } from 'redux-saga';
import { call, fork, put, select, take, race } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import {
  intercepted, unprefix, init, updatePathInfo, push, replace, changeComponent,
  PUSH, REPLACE, CHANGE_COMPONENT, HISTORY_ACTIONS
} from './actions';
import { parseQueryString, normOffset, removeOffset, toCamelCase, isReactComponent } from './utils';
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
    // TODO: 'action' is not used but...
    const unlisten = history.listen((location, action) => {
      emit(location);
    });
    return unlisten;
  }, buffers.expanding());
}

// https://redux-saga.github.io/redux-saga/docs/api/index.html#blocking--nonblocking
const EFFECT_TYPES = ['TAKE', 'CALL', 'APPLY', 'CPS', 'JOIN', 'CANCEL', 'FLUSH', 'CANCELLED', 'RACE'];
function isBlockEffect(effect) {
  return EFFECT_TYPES.map(type => !!effect[type]).reduce((p, c) => p || c, false);
}

function isChangeComponent(effect) {
  return !!(effect.PUT && effect.PUT.action && effect.PUT.action.type === CHANGE_COMPONENT);
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

// hooks: Stored current leaving hooks
// candidate: Candidate of leaving hooks in current route
function* runRouteAction(iterator, hooks, candidate, cancel, channel) {
  let ret;
  while (true) {
    let { value: effect, done } = iterator.next(ret);
    if (done) break;

    console.log('effect', effect);

    if (typeof effect === 'string') {
      console.log('convert to replace');
      effect = put(replace(effect));
    }

    if (isReactComponent(effect)) {
      console.log('convert to changeComponent');
      effect = put(changeComponent(effect));
    }

    if (isChangeComponent(effect)) {
      // Run leaving hooks before changing component
      let prevented = false;
      console.log('run leaving hooks', hooks);
      for (const hook of hooks) {
        if ((yield call(runHook, hook())) === false) {
          prevented = true;
          break;
        }
      }

      if (prevented) {
        return {
          prevented: true,     // Prevented in leaving hooks
          hooks,               // Keep current leaving hooks
          location: undefined, // No location change
        };
      }

      // Set new leaving hooks
      hooks = candidate;
      console.log('new leaving hooks', hooks);
    }

    if (isBlockEffect(effect)) {
      const { main, loc } = yield race({
        main: effect,
        loc: take(channel)
      });

      if (main) {
        ret = main;
      } else if (loc) {
        console.log('cancel', loc);

        // Run cancel hook. Ignore even if prevented
        yield call(runHook, cancel());

        return {
          prevented: true, // Prevented
          hooks: [],       // Clear leaving hooks
          location: loc,   // New location
        }; 
      } else {
        // XXX: NOOP...?
      }
    } else {
      ret = yield effect;
    }
  }

  return {
    prevented: false,    // Not prevented
    hooks,               // Keep or New
    location: undefined, // No location change
  }; 
}

// offset: normalized offset
function* theControlTower({ history, matcher, offset, cancel }) {
  // Channel to take location changes
  const channel = createLocationChannel(history);

  // Initial location
  yield put(push(removeOffset(history.location.pathname, offset)));

  let hooks = [], location;
  while (true) {
    if (!location) {
      location = yield take(channel);
    }

    const pathname = removeOffset(location.pathname, offset);
    const matched = matcher.match(pathname);
    if (!matched) {
      console.error(`No matched route: ${pathname} (original='${location.pathname}', offset='${offset}')`);
      location = undefined; // Clear to prevent infinite loop
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

    const [entering, action, leaving] = actions;

    // XXX: Thanks to the power of generator function, I can check that
    // these sagas may change a component or not without running them.
    for (const fn of [...entering, action]) {
      const iterator = fn === action ? fn(args) : fn();
      const ret = yield call(runRouteAction, iterator, hooks, leaving, cancel, channel);
      hooks = ret.hooks;
      if (ret.location) {
        location = ret.location;
      }
      if (ret.prevented === true) {
        break; // GOTO: Outermost while-loop
      }
    }
  }
}

function* handleLocationChange({ history, routes, initial, cancel, offset }) {
  // Prepare initial state
  yield put(init({ component: initial, offset }));

  // Start routing
  const matcher = createMatcher(routes);
  yield fork(theControlTower, { history, matcher, offset, cancel });
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
  if (typeof options.offset === 'undefined') {
    options.offset = '';
  }
  yield fork(handleLocationChange, options);
  yield fork(handleHistoryAction, options);
}
