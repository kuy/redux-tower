// @flow

import { createAction } from 'redux-actions';
import type { ActionCreator } from 'redux';

export type ActionType =
  | 'CHANGE_PAGE'
  | 'REQUEST_FETCH_POSTS' | 'SUCCESS_FETCH_POSTS' | 'FAILURE_FETCH_POSTS';

export type Action = {
  type: ActionType,
  payload?: any,
  meta?: any,
};

export const CHANGE_PAGE: ActionType = 'CHANGE_PAGE';
export const changePage: ActionCreator = createAction(CHANGE_PAGE);

export const REQUEST_FETCH_POSTS: ActionType = 'REQUEST_FETCH_POSTS';
export const SUCCESS_FETCH_POSTS: ActionType = 'SUCCESS_FETCH_POSTS';
export const FAILURE_FETCH_POSTS: ActionType = 'FAILURE_FETCH_POSTS';
export const requestFetchPosts: ActionCreator = createAction(REQUEST_FETCH_POSTS);
export const successFetchPosts: ActionCreator = createAction(SUCCESS_FETCH_POSTS);
export const failureFetchPosts: ActionCreator = createAction(FAILURE_FETCH_POSTS);
