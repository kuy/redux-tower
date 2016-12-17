// @flow

import type { Action } from './actions';
import { combineReducers } from 'redux';
import { SUCCESS_FETCH_POSTS } from './actions';
import Loading from './pages/loading';
import router from '../../src/reducer';

type Post = { id: string, title: string, body: string };

type AppState = {};
type PostsState = { list: Array<string>, entities: { [key: string]: Post } };

export type State = {
  app: AppState,
  posts: PostsState,
};

const initial: State = {
  app: {},
  posts: {
    list: [],
    entities: {},
    status: 'ready',
    error: false,
  },
};

const handlers = {
  app: {},
  posts: {
    REQUEST_FETCH_POSTS: state => {
      return { ...state, status: 'working', error: false };
    },
    SUCCESS_FETCH_POSTS: (state, { payload: { list, entities } }) => {
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
    },
    FAILURE_FETCH_POSTS: state => {
      return { ...state, status: 'ready', error: true };
    },
  },
};

function app(state: AppState = initial.app, action: Action): AppState {
  const handler = handlers.app[action.type];
  if (!handler) return state;
  return handler(state, action);
}

function posts(state: PostsState = initial.posts, action: Action): PostsState {
  const handler = handlers.posts[action.type];
  if (!handler) return state;
  return handler(state, action);
}

export default combineReducers(
  { app, posts, router }
);
