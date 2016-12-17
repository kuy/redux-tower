// @flow

import type { Action } from './actions';
import { combineReducers } from 'redux';
import {
  CHANGE_PAGE, TOGGLE_CART
} from './actions';

type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';
type ShopItem = { name: string, price: number, amount: number, roast: RoastLevel };

type AppState = { cart: boolen };
type ItemsState = { entities: { [key: string]: ShopItem }, list: Array<string> };
type RouteState = { page: ?Function };

export type State = {
  app: AppState,
  items: ItemsState,
  route: RouteState,
};

const initial: State = {
  app: {
    cart: false,
  },
  items: {
    entities: {
      '1': {
        name: 'Guatemala',
        price: 7,
        amount: 100,
        roast: 'medium'
      },
      '2': {
        name: 'Ethiopia',
        price: 9,
        amount: 100,
        roast: 'medium-dark'
      },
      '3': {
        name: 'Kenya',
        price: 8,
        amount: 100,
        roast: 'medium'
      },
    },
    list: ['1', '2', '3'],
  },
  route: {
    page: undefined,
  },
};

const handlers = {
  app: {
    TOGGLE_CART: state => {
      return { ...state, cart: !state.cart };
    }
  },
  items: {},
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

function items(state: ItemsState = initial.items, action: Action): ItemsState {
  const handler = handlers.items[action.type];
  if (!handler) return state;
  return handler(state, action);
}

function route(state: RouteState = initial.route, action: Action): RouteState {
  const handler = handlers.route[action.type];
  if (!handler) return state;
  return handler(state, action);
}

export default combineReducers(
  { app, items, route }
);
