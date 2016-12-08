// @flow

import type { Action } from './actions';
import { combineReducers } from 'redux';
import {
  CHANGE_PAGE
} from './actions';

type AppState = {};
type RouteState = { page: ?Function };

export type State = {
  app: AppState,
  route: RouteState,
};

const initial: State = {
  app: {},
  route: {
    page: undefined,
  },
};

const handlers = {
  app: {},
  route: {
    CHANGE_PAGE: (state, { payload: page }) => {
      return { ...state, page };
    }
  },
};

function app(state: AppState = initial.app, action: Action): AppState {
  const handler = handlers.app[action.type];
  if (!handler) return state;
  return handler(state, action);
}

function route(state: RouteState = initial.route, action: Action): RouteState {
  const handler = handlers.route[action.type];
  if (!handler) return state;
  return handler(state, action);
}

export default combineReducers(
  { app, route }
);
