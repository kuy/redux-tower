// @flow

import React from 'react';
import { eventChannel, buffers } from 'redux-saga';
import { call, fork, put, select, take, race } from 'redux-saga/effects';
import transform from 'domain-specific-saga';
import ruta3 from 'ruta3';
import {
  unprefix, init, updatePathInfo, push, replace, changeElement,
  PUSH, REPLACE, CHANGE_ELEMENT, HISTORY_ACTIONS
} from './actions';
import {
  parseQueryString, removeOffset, toCamelCase,
  isReactComponent, isBlock, isPut, isPrevent
} from './utils';
import preprocess, { ROUTES, getConfigurationActions } from './preprocess';
import { getOffset } from './reducer';

import type { Channel } from 'redux-saga';
import type { IOEffect } from 'redux-saga/effects';
import type { Action } from './actions';

export type Routes = {
  [key: string | number]: any[] | string | Generator<*,void,*> | React.Element<*> | Routes;
}

export interface Location {
  pathname: string;
  search: string;
}

export type History = {
  location: Location;
  length: number;
  action: string;
  listen:((location: Location, action: string) => void) => any;
}

export interface SagaOptions {
  history: History;
  matcher: any;
  offset: string;
  routes: Routes;
}

export interface ControllTowerOptions {
  history: History;
  matcher: any;
  offset: string;
}

export interface RouterArray {
  prevented: boolean;
  hooks: any;
  location: ?Location;
}

export interface BlockReturn {
  main: boolean;
  loc: Location;
}

export function createMatcher(routes: Routes): any {
  routes = preprocess(routes);
  const matcher = ruta3();
  for (const path of Object.keys(routes)) {
    const action = routes[path];
    matcher.addRoute(path, action);
  }
  matcher[ROUTES] = routes;
  return matcher;
}

function createLocationChannel(history: History): Channel {
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
export function* runRouteAction(iterator: any, hooks: any, candidate: any,
                                cancel: any, channel: any, asHook: boolean): Generator<IOEffect,RouterArray,RouterArray&BlockReturn> {
  // Setup Domain Specific Saga
  const rules = [
    value => typeof value === 'string' ? put(replace(value)) : value,
    (value) => {
      if (isReactComponent(value)) {
        throw new Error('Use React Element instead of React Component');
      }
      return React.isValidElement(value) ? put(changeElement(value)) : value;
    }
  ];
  iterator = transform(iterator, rules);

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

    if (isPut(effect, CHANGE_ELEMENT)) {
      // Run leaving hooks before changing element
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

export function* theControlTower({ history, matcher, offset }: ControllTowerOptions): Generator<IOEffect,void,Location&RouterArray> {
  const { cancel, error, initial } = getConfigurationActions(matcher);
  const channel = createLocationChannel(history);

  // Run initial action
  if (initial) {
    yield call(runRouteAction, initial(), [], [], undefined, channel, false);
  }

  // Initial location
  yield put(push(removeOffset(history.location.pathname, offset)));

  let hooks = [], location;
  while (true) {
    if (!location) {
      // add empty string to prevent from flow error
      location = yield take(channel, '');
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
      if (!error) {
        console.error(`No matched route and error page: ${pathname} (original='${location.pathname}', offset='${offset}')`);
        location = undefined; // Clear to prevent infinite loop
        continue;
      }

      // Fallback to error page
      args = {};
      [entering, action, leaving] = [[], error, []];
    }

    console.log('actions', entering, action, leaving);

    if (isReactComponent(action)) {
      throw new Error('Use React Element instead of React Component');
    }

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

function* handleLocationChange({ history, routes, offset }: SagaOptions): Generator<IOEffect,void,void> {
  // Prepare initial state
  yield put(init({ offset }));

  // Start routing
  const matcher = createMatcher(routes);
  yield fork(theControlTower, { history, matcher, offset });
}

function* handleHistoryAction({ history }: SagaOptions): Generator<IOEffect,void,Action&string> {
  while (true) {
    const { type, payload } = yield take(HISTORY_ACTIONS);

    if (type === PUSH || type === REPLACE) {
      // Prepend offset to path at first argument in payload
      const offset = yield select(getOffset);
      if (offset) {
        payload[0] = offset + payload[0];
      }
    }

    const historyFunction = history[toCamelCase(unprefix(type))];
    historyFunction(...payload);
  }
}

export default function* routerSaga(options: SagaOptions): Generator<IOEffect,void,void> {
  if (typeof options.offset === 'undefined') {
    options.offset = '';
  }
  yield fork(handleLocationChange, options);
  yield fork(handleHistoryAction, options);
}
