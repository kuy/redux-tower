// @flow

import { createAction } from 'redux-actions';
import type { ActionCreator } from 'redux';

export type ActionType =
  | 'REQUEST_FETCH_POSTS' | 'SUCCESS_FETCH_POSTS' | 'FAILURE_FETCH_POSTS'
  | 'PREFLIGHT_REQUEST_SEARCH' | 'REQUEST_SEARCH' | 'SUCCESS_SEARCH' | 'FAILURE_SEARCH';

export type Action = {
  type: ActionType,
  payload?: any,
  meta?: any,
};

export const REQUEST_FETCH_POSTS: ActionType = 'REQUEST_FETCH_POSTS';
export const SUCCESS_FETCH_POSTS: ActionType = 'SUCCESS_FETCH_POSTS';
export const FAILURE_FETCH_POSTS: ActionType = 'FAILURE_FETCH_POSTS';
export const requestFetchPosts: ActionCreator = createAction(REQUEST_FETCH_POSTS);
export const successFetchPosts: ActionCreator = createAction(SUCCESS_FETCH_POSTS);
export const failureFetchPosts: ActionCreator = createAction(FAILURE_FETCH_POSTS);

export const PREFLIGHT_REQUEST_SEARCH = 'PREFLIGHT_REQUEST_SEARCH';
export const REQUEST_SEARCH = 'REQUEST_SEARCH';
export const SUCCESS_SEARCH = 'SUCCESS_SEARCH';
export const FAILURE_SEARCH = 'FAILURE_SEARCH';
export const preflightRequestSearch = createAction(PREFLIGHT_REQUEST_SEARCH);
export const requestSearch = createAction(REQUEST_SEARCH);
export const successSearch = createAction(SUCCESS_SEARCH);
export const failureSearch = createAction(FAILURE_SEARCH);
