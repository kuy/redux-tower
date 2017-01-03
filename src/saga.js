import { eventChannel, buffers } from 'redux-saga';
import { call, fork, put, select, take, race } from 'redux-saga/effects';
import ruta3 from 'ruta3';
import {
  intercepted, unprefix, init, updatePathInfo, push, replace, changeComponent,
  PUSH, REPLACE, CHANGE_COMPONENT, HISTORY_ACTIONS
} from './actions';
import {
  parseQueryString, normOffset, removeOffset, toCamelCase,
  isReactComponent, isBlock, isPut, isPrevent
} from './utils';
import preprocess, { ERROR, ROUTES } from './preprocess';
import { getOffset } from './reducer';

export function createMatcher(routes) {
  routes = preprocess(routes);
  const matcher = ruta3();
  for (const path of Object.keys(routes)) {
    const action = routes[path];
    matcher.addRoute(path, action);
  }
  matcher[ROUTES] = routes;
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

// hooks: Stored current leaving hooks
// candidate: Candidate of leaving hooks in current route
export function* runRouteAction(iterator, hooks, candidate, cancel, channel, asHook) {
  let ret;
  while (true) {
    let { value: effect, done } = iterator.next(ret);
    if (done) break;

    console.log('effect', effect);

    if (effect === false) {
      return {
        prevented: true,     // Prevented in entering/leaving hooks
        hooks,               // Keep current leaving hooks
        location: undefined, // No location change
      };
    }

    if (typeof effect === 'string') {
      console.log('convert to replace');
      effect = put(replace(effect));
    }

    if (isReactComponent(effect)) {
      console.log('convert to changeComponent');
      effect = put(changeComponent(effect));
    }

    if (isPut(effect, CHANGE_COMPONENT)) {
      // Run leaving hooks before changing component
      console.log('run leaving hooks', hooks);
      for (const hook of hooks) {
        // TODO: check returned hooks and location
        const ret = yield call(runRouteAction, hook(), [], [], undefined, channel, true);
        console.log('done leaving hooks', ret);
        if (ret.prevented === true) {
          return {
            prevented: true,     // Prevented in leaving hooks
            hooks,               // Keep current leaving hooks
            location: undefined, // No location change
          };
        }
      }

      // Set new leaving hooks
      hooks = candidate;
      console.log('new leaving hooks', hooks);
    }

    if (isBlock(effect)) {
      const { main, loc } = yield race({
        main: effect,
        loc: take(channel)
      });

      if (main) {
        ret = main;
      } else if (loc) {
        console.log('cancel', loc);

        if (typeof cancel === 'function') {
          // Run cancel hook. Ignore even if prevented
          yield call(runRouteAction, cancel(), [], [], undefined, channel, true);
        }

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

    if (asHook && isPrevent(effect)) {
      console.log('prevent effect is yielded in hooks');
      return {
        prevented: true,     // Prevented in entering hooks
        hooks,               // Keep current leaving hooks
        location: undefined, // No location change
      };
    }
  }

  return {
    prevented: false,    // Not prevented
    hooks,               // Keep or New
    location: undefined, // No location change
  }; 
}

// offset: normalized offset
export function* theControlTower({ history, matcher, offset, cancel }) {
  // Channel to take location changes
  const channel = createLocationChannel(history);

  // Initial location
  yield put(push(removeOffset(history.location.pathname, offset)));

  let hooks = [], location;
  while (true) {
    if (!location) {
      location = yield take(channel);
    }

    let entering, action, leaving, args;

    const pathname = removeOffset(location.pathname, offset);
    const matched = matcher.match(pathname);
    if (matched) {
      console.log('matched', matched);

      const { action: actions, params, route, splats } = matched;
      args = {
        path: pathname,
        params,
        query: parseQueryString(location.search),
        splats,
        route,
      };

      yield put(updatePathInfo(args));

      [entering, action, leaving] = actions;
    } else {
      console.log('matched', '[no matched route]');

      if (!matcher[ROUTES][ERROR]) {
        console.error(`No matched route and error page: ${pathname} (original='${location.pathname}', offset='${offset}')`);
        location = undefined; // Clear to prevent infinite loop
        continue;
      }

      // Fallback to error page
      args = {};
      [entering, action, leaving] = matcher[ROUTES][ERROR];
    }

    console.log('actions', entering, action, leaving);

    // Clear for detecting location change while running action
    location = undefined;

    for (const fn of [...entering, action]) {
      const [iterator, asHook] = fn === action ? [fn(args), false] : [fn(), true];
      const ret = yield call(runRouteAction, iterator, hooks, leaving, cancel, channel, asHook);
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
      const offset = yield select(getOffset);
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
