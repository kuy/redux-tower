// @flow

import type { Action } from './actions';
import { combineReducers } from 'redux';
import { REQUEST_FETCH_POSTS, SUCCESS_FETCH_POSTS, FAILURE_FETCH_POSTS, CANCEL_FETCH_POSTS } from './actions';
import Loading from './pages/loading';
import router from '../../src/reducer';
import type { PostId, Post } from './api';

type AppState = {};
type PostsState = { list: Array<PostId>, entities: { [PostId]: Post } };

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
    REQUEST_FETCH_POSTS: (state: PostsState): PostsState => {
      return { ...state, status: 'working', error: false };
    },
    SUCCESS_FETCH_POSTS: (state: PostsState, { payload: { list, entities } }: Action): PostsState => {
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
    CANCEL_FETCH_POSTS: state => {
      return { ...state, status: 'ready', error: false };
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
