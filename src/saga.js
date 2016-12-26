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

function createAliasResolver(routes) {
  return (() => {
    // TODO: Poor implementation :(
    const memo = [];
    const isCircular = () => {
      if (3 <= memo.length) {
        const [p3, p2, p1] = memo.slice(0, 3);
        if (p1 === p2 && p2 === p3) return true;
      }
      if (3 <= memo.length) {
        const [p3, p2, p1] = memo.slice(0, 3);
        if (p1 === p3) return true;
      }
      return false;
    };

    return function innerResolve(path) {
      // Check circular references
      memo.unshift(path);
      if (isCircular()) {
        // console.log(`${path} in ${memo.join(' <- ')}`);
        throw new Error(`Detected circular reference in '${path}'`);
      }

      // Resolve aliases
      const dest = routes[path];
      if (typeof dest !== 'string') {
        return dest;
      }

      return innerResolve(dest);
    };
  })();
}

// FIXME: Poor implementation :(
export function resolveRelative(route, base) {
  if (route.indexOf('/') === 0) {
    return route;
  }

  if (route.indexOf('./') === 0) {
    return base.join('') + route.slice(1);
  }

  // TODO: Throw exception if invalid traversal
  base = [...base];

  const segments = route.split('/');
  while (0 < segments.length) {
    const segment = segments[0]; // Peek first segment
    if (segment === '..') {
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

export function flatten(routes) {
  const r = {};
  const stack = [{
    current: routes,
    name: '',
    backlog: Object.keys(routes).map(key => ([key, key])),
  }];

  while (0 < stack.length) {
    const { current, backlog } = stack[stack.length - 1]; // Peek current backlog
    while (0 < backlog.length) {
      const [key, path] = backlog.shift();
      let value = current[key];
      if (typeof value === 'object') {
        const base = stack.map(l => l.name).join('') + key;
        stack.push({
          current: value,
          name: key,
          backlog: Object.keys(value).map(key => ([key, base + key])),
        });
        break; // Digging
      } else {
        if (typeof value === 'string') {
          value = norm(resolveRelative(value, stack.map(l => l.name)));
        }
        r[norm(path)] = value;
      }
    }

    if (backlog === stack[stack.length - 1].backlog && backlog.length === 0) {
      stack.pop(); // Pop only if not pushed a new one
    }
  }

  return r;
}

export function preprocess(routes) {
  // 1. Flatten nested and relative routes
  routes = flatten(routes);

  // 2. Replace React component with auto-generated route actions (sagas)
  for (const path of Object.keys(routes)) {
    const value = routes[path];
    if (value.prototype && typeof value.prototype.isReactComponent !== 'undefined') {
      routes[path] = createRouteAction(value);
    }
  }

  // 3. Resolve redirect/alias with detecting circular references
  for (const path of Object.keys(routes)) {
    const resolve = createAliasResolver(routes);
    const value = routes[path];
    if (typeof value === 'string') {
      routes[path] = resolve(value);
    }
  }

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

  // Routing
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
