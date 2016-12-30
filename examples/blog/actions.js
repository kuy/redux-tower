// @flow

import { createAction } from 'redux-actions';
import type { ActionCreator } from 'redux';

export type ActionType =
  | 'REQUEST_FETCH_POSTS' | 'SUCCESS_FETCH_POSTS' | 'FAILURE_FETCH_POSTS' | 'CANCEL_FETCH_POSTS'
  | 'REQUEST_CREATE_POST' | 'SUCCESS_CREATE_POST' | 'FAILURE_CREATE_POST' | 'CANCEL_CREATE_POST'
  | 'REQUEST_STORE_POST' | 'SUCCESS_STORE_POST' | 'FAILURE_STORE_POST' | 'CANCEL_STORE_POST'
  | 'REQUEST_SEARCH'
  | 'REQUEST_LOGIN' | 'SUCCESS_LOGIN' | 'FAILURE_LOGIN'
  | 'REQUEST_LOGOUT' | 'SUCCESS_LOGOUT' | 'FAILURE_LOGOUT'
  | 'UPDATE_DIRTY';

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

export const REQUEST_CREATE_POST: ActionType = 'REQUEST_CREATE_POST';
export const SUCCESS_CREATE_POST: ActionType = 'SUCCESS_CREATE_POST';
export const FAILURE_CREATE_POST: ActionType = 'FAILURE_CREATE_POST';
export const CANCEL_CREATE_POST: ActionType = 'CANCEL_CREATE_POST';
export const requestCreatePost: ActionCreator = createAction(REQUEST_CREATE_POST);
export const successCreatePost: ActionCreator = createAction(SUCCESS_CREATE_POST);
export const failureCreatePost: ActionCreator = createAction(FAILURE_CREATE_POST);
export const cancelCreatePost: ActionCreator = createAction(CANCEL_CREATE_POST);

export const REQUEST_STORE_POST: ActionType = 'REQUEST_STORE_POST';
export const SUCCESS_STORE_POST: ActionType = 'SUCCESS_STORE_POST';
export const FAILURE_STORE_POST: ActionType = 'FAILURE_STORE_POST';
export const CANCEL_STORE_POST: ActionType = 'CANCEL_STORE_POST';
export const requestStorePost: ActionCreator = createAction(REQUEST_STORE_POST);
export const successStorePost: ActionCreator = createAction(SUCCESS_STORE_POST);
export const failureStorePost: ActionCreator = createAction(FAILURE_STORE_POST);
export const cancelStorePost: ActionCreator = createAction(CANCEL_STORE_POST);

export const REQUEST_DELETE_POST: ActionType = 'REQUEST_DELETE_POST';
export const SUCCESS_DELETE_POST: ActionType = 'SUCCESS_DELETE_POST';
export const FAILURE_DELETE_POST: ActionType = 'FAILURE_DELETE_POST';
export const CANCEL_DELETE_POST: ActionType = 'CANCEL_DELETE_POST';
export const requestDeletePost: ActionCreator = createAction(REQUEST_DELETE_POST);
export const successDeletePost: ActionCreator = createAction(SUCCESS_DELETE_POST);
export const failureDeletePost: ActionCreator = createAction(FAILURE_DELETE_POST);
export const cancelDeletePost: ActionCreator = createAction(CANCEL_DELETE_POST);

export const REQUEST_SEARCH = 'REQUEST_SEARCH';
export const requestSearch = createAction(REQUEST_SEARCH);

export const REQUEST_LOGIN: ActionType = 'REQUEST_LOGIN';
export const SUCCESS_LOGIN: ActionType = 'SUCCESS_LOGIN';
export const FAILURE_LOGIN: ActionType = 'FAILURE_LOGIN';
export const requestLogin: ActionCreator = createAction(REQUEST_LOGIN);
export const successLogin: ActionCreator = createAction(SUCCESS_LOGIN);
export const failureLogin: ActionCreator = createAction(FAILURE_LOGIN);

export const REQUEST_LOGOUT: ActionType = 'REQUEST_LOGOUT';
export const SUCCESS_LOGOUT: ActionType = 'SUCCESS_LOGOUT';
export const FAILURE_LOGOUT: ActionType = 'FAILURE_LOGOUT';
export const requestLogout: ActionCreator = createAction(REQUEST_LOGOUT);
export const successLogout: ActionCreator = createAction(SUCCESS_LOGOUT);
export const failureLogout: ActionCreator = createAction(FAILURE_LOGOUT);

export const UPDATE_DIRTY = 'UPDATE_DIRTY';
export const updateDirty = createAction(UPDATE_DIRTY);
