// @flow

import { createAction } from 'redux-actions';
import type { ActionCreator } from 'redux';

export type ActionType =
  | 'REQUEST_FETCH_POSTS' | 'SUCCESS_FETCH_POSTS' | 'FAILURE_FETCH_POSTS' | 'CANCEL_FETCH_POSTS'
  | 'REQUEST_STORE_POSTS' | 'SUCCESS_STORE_POSTS' | 'FAILURE_STORE_POSTS' | 'CANCEL_STORE_POSTS'
  | 'REQUEST_SEARCH'
  | 'REQUEST_LOGIN' | 'SUCCESS_LOGIN' | 'FAILURE_LOGIN';

export type Action = {
  type: ActionType,
  payload: any,
  meta?: any,
};

export const REQUEST_FETCH_POSTS: ActionType = 'REQUEST_FETCH_POSTS';
export const SUCCESS_FETCH_POSTS: ActionType = 'SUCCESS_FETCH_POSTS';
export const FAILURE_FETCH_POSTS: ActionType = 'FAILURE_FETCH_POSTS';
export const CANCEL_FETCH_POSTS: ActionType = 'CANCEL_FETCH_POSTS';
export const requestFetchPosts: ActionCreator = createAction(REQUEST_FETCH_POSTS);
export const successFetchPosts: ActionCreator = createAction(SUCCESS_FETCH_POSTS);
export const failureFetchPosts: ActionCreator = createAction(FAILURE_FETCH_POSTS);
export const cancelFetchPosts: ActionCreator = createAction(CANCEL_FETCH_POSTS);

export const REQUEST_STORE_POSTS: ActionType = 'REQUEST_STORE_POSTS';
export const SUCCESS_STORE_POSTS: ActionType = 'SUCCESS_STORE_POSTS';
export const FAILURE_STORE_POSTS: ActionType = 'FAILURE_STORE_POSTS';
export const CANCEL_STORE_POSTS: ActionType = 'CANCEL_STORE_POSTS';
export const requestStorePosts: ActionCreator = createAction(REQUEST_STORE_POSTS);
export const successStorePosts: ActionCreator = createAction(SUCCESS_STORE_POSTS);
export const failureStorePosts: ActionCreator = createAction(FAILURE_STORE_POSTS);
export const cancelStorePosts: ActionCreator = createAction(CANCEL_STORE_POSTS);

export const REQUEST_SEARCH = 'REQUEST_SEARCH';
export const requestSearch = createAction(REQUEST_SEARCH);

export const REQUEST_LOGIN: ActionType = 'REQUEST_LOGIN';
export const SUCCESS_LOGIN: ActionType = 'SUCCESS_LOGIN';
export const FAILURE_LOGIN: ActionType = 'FAILURE_LOGIN';
export const requestLogin: ActionCreator = createAction(REQUEST_LOGIN);
export const successLogin: ActionCreator = createAction(SUCCESS_LOGIN);
export const failureLogin: ActionCreator = createAction(FAILURE_LOGIN);
