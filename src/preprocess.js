import React from 'react';
import { put } from 'redux-saga/effects';
import { replace, changeElement, isPrefixed, PREFIX } from './actions';

export const ROUTES = `${PREFIX}ROUTES`;
export const CANCEL = `${PREFIX}CANCEL`;
export const ERROR = `${PREFIX}ERROR`;
export const INITIAL = `${PREFIX}INITIAL`;

export const getConfigurationActions = matcher => {
  return {
    cancel: matcher[ROUTES][CANCEL],
    error: matcher[ROUTES][ERROR],
    initial: matcher[ROUTES][INITIAL],
  };
};

function createRouteAction(Element) {
  return function* elementRouteAction() {
    yield put(changeElement(Element));
  };
}

function createLazyRedirectAction(path) {
  return function* lazyRedirectAction() {
    yield put(replace(path));
  };
}

const MAX_REDIRECTIONS = 10;

// NOTE: Destructive operation
// routes: already flatten
export function resolve(routes) {
  for (const path of Object.keys(routes)) {
    let count = 0, current = path;
    while (true) {
      if (MAX_REDIRECTIONS < count++) {
        throw new Error(`Potential for circular reference in '${path}'`);
      }

      let actions = routes[current];
      if (typeof actions === 'undefined') {
        actions = [[], createLazyRedirectAction(current), []];
      }

      const [enter, action, leave] = actions;
      if (typeof action !== 'string') {
        routes[path] = actions;
        break;
      }

      current = action;
    }
  }
}

export function interpolate(routes, entering = [], leaving = []) {
  const r = {};
  for (const segment of Object.keys(routes)) {
    let rval = routes[segment];
    // Array or not React Element Object
    if (typeof rval === 'object' && !React.isValidElement(rval)) {
      if (!Array.isArray(rval)) {
        rval = [rval];
      }

      let enter, action, leave;
      switch (rval.length) {
      case 1:
        [action] = rval;
        break;
      case 2:
        if (typeof rval[0] !== 'object' && typeof rval[1] !== 'object') {
          // Special pattern: route action with leave hook
          r[segment] = [entering, rval[0], [rval[1], ...leaving]];
          continue;
        }
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

      if (React.isValidElement(action)) {
        const retEnter = (enter) ? [enter] : entering;
        const retLeave = (leave) ? [leave] : leaving;
        r[segment] = [retEnter, action, retLeave];
      } else {
        // Normalize recursively
        r[segment] = interpolate(
          action,
          [...entering, enter].filter(h => !!h),
          [leave, ...leaving].filter(h => !!h)
        );
      }

    } else {
      // Interpolate hooks
      r[segment] = [entering, rval, leaving];
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
      if (typeof action === 'object' && !React.isValidElement(action)) {
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

// NOTE: Destructive operation
function amend(routes) {
  for (const segment of Object.keys(routes)) {
    if (isPrefixed(segment)) {
      routes[segment] = routes[segment][1];
    }
  }
}

export default function preprocess(routes) {
  // 1. Interpolate hooks in nested routes
  routes = interpolate(routes);

  // 2. Flatten nested and resolve relative routes
  routes = flatten(routes);

  // 3. Replace React element with auto-generated route actions (sagas)
  for (const segment of Object.keys(routes)) {
    const [enter, action, leave] = routes[segment];
    if (React.isValidElement(action)) {
      routes[segment] = [enter, createRouteAction(action), leave];
    }
  }

  // 4. Resolve redirect/alias with detecting circular references
  resolve(routes);

  // 5. Amend configuration routes
  amend(routes);

  return routes;
}
