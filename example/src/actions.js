// @flow

import { createAction } from 'redux-actions';
import type { ActionCreator } from 'redux';

export type ActionType =
  | 'CHANGE_PAGE';

export type Action = {
  type: ActionType,
  payload?: any,
  meta?: any,
};

export const CHANGE_PAGE: ActionType = 'CHANGE_PAGE';
export const changePage: ActionCreator = createAction(CHANGE_PAGE);
