import { eventChannel, takeLatest } from 'redux-saga';
import { call, fork, put, select, take, cancelled } from 'redux-saga/effects';
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
function createHandler(matcher, offset, cancel) {
  return function* handler({ location, action }) {
    // TODO: Handle 'action' argument
    const pathname = removeOffset(location.pathname, offset);
    const matched = matcher.match(pathname);
    if (matched) {
      const { action, params, route, splats } = matched;
      const args = {
        path: pathname,
        params,
        query: parseQueryString(location.search),
        splats,
        route,
      };

      yield put(updatePathInfo(args));

      try {
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

function createRouteAction(Component) {
  const name = `generated${Component.displayName || 'Unknown'}Component`;
  const action = {
    [name]: function* () {
      yield put(changeComponent(Component));
    }
  };
  return action[name];
}

const MAX_REDIRECTIONS = 10;

// routes: already flatten
export function resolve(routes) {
  for (const path of Object.keys(routes)) {
    let count = 0, current = path;
    while (true) {
      if (MAX_REDIRECTIONS < count++) {
        throw new Error(`Potential for circular reference in '${path}'`);
      }

      const [enter, action, leave] = routes[current];
      if (typeof action !== 'string') {
        routes[path] = routes[current];
        break;
      }

      current = action;
    }
  }
}

export function interpolate(routes, enterHooks = [], leaveHooks = []) {
  const r = {};
  for (const segment of Object.keys(routes)) {
    let rval = routes[segment];
    if (typeof rval === 'object') {
      if (!Array.isArray(rval)) {
        rval = [rval];
      }

      let enter, action, leave;
      switch (rval.length) {
        case 1:
          [action] = rval;
          break;
        case 2:
          if (typeof rval[0] === 'object') {
            [action, leave] = rval;
          } else {
            [enter, action] = rval;
          }
          break;
        case 3:
          [enter, action, leave] = rval;
          break;
        default:
          throw new Error(`You can only use one hook each enter/leave in '${segment}': length=${rval.length}`);
      }

      if (typeof action !== 'object') {
        throw new Error(`Hooks can be specified with nested routes in '${segment}'`);
      }

      // Normalize recursively
      r[segment] = interpolate(
        action,
        [...enterHooks, enter].filter(h => !!h),
        [leave, ...leaveHooks].filter(h => !!h)
      );
    } else {
      // Interpolate hooks
      r[segment] = [enterHooks, rval, leaveHooks];
    }
  }
  return r;
}

// FIXME: Poor implementation :(
export function resolveRelative(route, base) {
  if (route.indexOf('/') === 0) {
    return route;
  }

  if (route.indexOf('./') === 0) {
    return base.join('') + route.slice(1);
  }

  base = [...base];

  const segments = route.split('/');
  while (0 < segments.length) {
    // Peek first segment
    const segment = segments[0];
    if (segment === '..') {
      // TODO: Throw exception if invalid traversal
      segments.shift();
      base.pop();
    } else {
      break;
    }
  }

  return base.join('') + segments.map(s => '/' + s).join('');
}

function norm(path) {
  if (path.lastIndexOf('/') === path.length - 1) {
    path = path.slice(0, path.length - 1);
  }
  if (path === '') {
    path = '/';
  }
  return path;
}

// TODO: Rewrite stack to recursive
// routes: already interpolated
export function flatten(routes) {
  const r = {};
  const stack = [{
    current: routes,
    name: '',
    backlog: Object.keys(routes).map(key => ([key, key])),
  }];

  while (0 < stack.length) {
    // Peek current backlog
    let { current, backlog } = stack[stack.length - 1];
    while (0 < backlog.length) {
      const [key, path] = backlog.shift();
      let rval = current[key];
      let action = Array.isArray(rval) ? rval[1] : rval;
      if (typeof action === 'object') {
        const base = stack.map(l => l.name).join('') + key;
        stack.push({
          current: action,
          name: key,
          backlog: Object.keys(action).map(key => ([key, base + key])),
        });
        break; // Digging down
      } else {
        if (typeof action === 'string') {
          // Resolve relative routes
          action = norm(resolveRelative(action, stack.map(l => l.name)));
        }
        if (Array.isArray(rval)) {
          r[norm(path)] = [rval[0], action, rval[2]];
        } else {
          r[norm(path)] = action;
        }
      }
    }

    if (backlog === stack[stack.length - 1].backlog && backlog.length === 0) {
      stack.pop(); // Pop only if not pushed a new one
    }
  }

  return r;
}

export function preprocess(routes) {
  // 1. Interpolate hooks in nested routes
  routes = interpolate(routes);

  // 2. Flatten nested and resolve relative routes
  routes = flatten(routes);

  // 3. Replace React component with auto-generated route actions (sagas)
  for (const segment of Object.keys(routes)) {
    const [enter, action, leave] = routes[segment];
    if (action.prototype && typeof action.prototype.isReactComponent !== 'undefined') {
      routes[segment] = [enter, createRouteAction(action), leave];
    }
  }

  // 4. Resolve redirect/alias with detecting circular references
  resolve(routes);

  return routes;
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
