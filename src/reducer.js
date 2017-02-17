import { INIT, CHANGE_ELEMENT, UPDATE_PATH_INFO } from './actions';

import type { Element } from 'react';
import type { Action } from './actions';

export interface Initial {
  element?: Element<*>;
  path?: string;
  params?: string;
  query?: string;
  splats?: string[];
  route?: any;
  offset?: string;
}

export interface GetOffset {
  (state: Initial): string;
}

const initial = {
  element: undefined,
  path: undefined,
  params: undefined,
  query: undefined,
  splats: undefined,
  route: undefined,
  offset: undefined,
};

// FIXME: Assuming fixed reducer/state name 'router'
export const getOffset: GetOffset = state => state.router.offset;

export default function routerReducer(state: Initial = initial, { type, payload }: Action) {
  switch (type) {
  case INIT:
    return { ...state, ...payload };
  case CHANGE_ELEMENT:
    return { ...state, element: payload };
  case UPDATE_PATH_INFO:
    return { ...state, ...payload };
  default:
    return state;
  }
}
