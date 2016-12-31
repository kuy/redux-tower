// @flow

import { combineReducers } from 'redux';
import {
  REQUEST_FETCH_POSTS, SUCCESS_FETCH_POSTS, FAILURE_FETCH_POSTS, CANCEL_FETCH_POSTS,
  REQUEST_LOGIN, SUCCESS_LOGIN, FAILURE_LOGIN,
  REQUEST_LOGOUT, SUCCESS_LOGOUT, FAILURE_LOGOUT,
  UPDATE_DIRTY,
} from './actions';
import { reducer as router } from '../../src/index';
import type { Action } from './actions';
import type { PostId, Post } from './api';

type StatusType = 'ready' | 'working';
type StatusState = { status: StatusType, error: boolean };
type AppState = StatusState & { login: ?string };
type PostsState = StatusState & { list: Array<PostId>, entities: { [PostId]: Post } };

export type State = {
  app: AppState,
  posts: PostsState,
};

const initial: State = {
  app: {
    login: undefined,
    status: 'ready',
    error: false,
  },
  posts: {
    list: [],
    entities: {},
    status: 'ready',
    error: false,
    dirty: false,
  },
};

export const isLoggedIn = state => typeof state.app.login !== 'undefined';
export const isDirty = state => typeof state.posts.dirty;

function app(state: AppState = initial.app, { type, payload }: Action): AppState {
  switch (type) {
    case REQUEST_LOGIN:
      return { ...state, login: undefined, status: 'working' };
    case SUCCESS_LOGIN:
      return { ...state, login: payload.username, status: 'ready', error: false };
    case FAILURE_LOGIN:
      return { ...state, login: undefined, status: 'ready', error: true };

    case REQUEST_LOGOUT:
      return { ...state, status: 'working' };
    case SUCCESS_LOGOUT:
      return { ...state, status: 'ready', error: false, login: undefined };
    case FAILURE_LOGOUT:
      return { ...state, status: 'ready', error: true };
  }

  return state;
}

function posts(state: PostsState = initial.posts, { type, payload }: Action): PostsState {
  switch (type) {
    case REQUEST_FETCH_POSTS:
      return { ...state, status: 'working' };
    case SUCCESS_FETCH_POSTS:
      const { list, entities } = payload;
      return {
        ...state,
        status: 'ready',
        error: false,
        list,
        entities: {
          ...state.entities,
          ...entities,
        },
      };
    case FAILURE_FETCH_POSTS:
      return { ...state, status: 'ready', error: true };
    case CANCEL_FETCH_POSTS:
      return { ...state, status: 'ready', error: false };
    case UPDATE_DIRTY:
      return { ...state, dirty: payload };
  }

  return state;
}

export default combineReducers(
  { app, posts, router }
);
