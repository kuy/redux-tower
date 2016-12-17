// @flow

import { createAction } from 'redux-actions';
import type { ActionCreator } from 'redux';

export type ActionType =
  | 'CHANGE_PAGE'
  | 'TOGGLE_CART';

export type Action = {
  type: ActionType,
  payload?: any,
  meta?: any,
};

export const CHANGE_PAGE: ActionType = 'CHANGE_PAGE';
export const changePage: ActionCreator = createAction(CHANGE_PAGE);

export const TOGGLE_CART: ActionType = 'TOGGLE_CART';
export const toggleCart: ActionCreator = createAction(TOGGLE_CART);
