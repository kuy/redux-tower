// @flow

import { put, call, fork, take, select } from 'redux-saga/effects';
import { createBrowserHistory, createMiddleware, saga as router } from '../../../src/index';
import { loadPosts, loadPost } from './posts';
import {
  SUCCESS_CREATE_POST, FAILURE_CREATE_POST, CANCEL_CREATE_POST,
  SUCCESS_STORE_POST, FAILURE_STORE_POST, CANCEL_STORE_POST,
  SUCCESS_DELETE_POST, FAILURE_DELETE_POST, CANCEL_DELETE_POST,
  SUCCESS_LOGIN, FAILURE_LOGIN, SUCCESS_LOGOUT, FAILURE_LOGOUT,
  cancelFetchPosts, updateDirty
} from '../actions';

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import About from '../pages/about';
import Loading from '../pages/loading';
import UsersLogin from '../pages/users/login';
import AdminPostsIndex from '../pages/admin/posts/index';
import AdminPostsNew from '../pages/admin/posts/new';
import AdminPostsEdit from '../pages/admin/posts/edit';

import type { IOEffect } from 'redux-saga/effects';

const routes = {
  '/': '/posts',
  '/posts': {
    '/': function* postsIndexPage({ query }) {
      yield call(loadPosts, query);
      yield PostsIndex;
    },
    '/:id': function* postsShowPage({ params: { id } }) {
      yield call(loadPost, id);
      yield PostsShow;
    },
  },
  '/users': {
    '/login': {
      '/': UsersLogin,
      '/processing': function* usersLoginProcessingAction() {
        const { type } = yield take([SUCCESS_LOGIN, FAILURE_LOGIN]);
        if (type === SUCCESS_LOGIN) {
          yield Loading;
          yield '/admin/posts';
        } else {
          yield '/users/login';
        }
      },
    },
    '/logout': function* usersLogoutAction() {
      const { type } = yield take([SUCCESS_LOGOUT, FAILURE_LOGOUT]);
      if (type === SUCCESS_LOGOUT) {
        yield Loading;
        yield '/';
      } else {
        // NOTE: Already logged-out?
      }
    },
  },
  '/admin': [function* adminEnterHook() {
    console.log('admin enter hook');
    const { login } = yield select(state => state.app);
    if (!login) {
      yield '/users/login';
    }
  }, {
    '/posts': [function* adminPostsEnterHook() {
      console.log('admin posts enter hook');
    }, {
      '/': function* adminPostsIndexPage({ query }) {
        query.limit = 10;
        yield call(loadPosts, query);
        yield AdminPostsIndex;
      },
      '/new': AdminPostsNew,
      '/create': function* adminPostsCreateAction() {
        // FIXME: Routing based on the result
        yield take([SUCCESS_CREATE_POST, FAILURE_CREATE_POST, CANCEL_CREATE_POST]);
        yield '/admin/posts';
      },
      '/:id/edit': [function* adminPostsEditPage({ params: { id } }) {
        yield call(loadPost, id);
        yield AdminPostsEdit;
      }, function* adminPostsEditLeaveHook() {
        console.log('admin posts edit leave hook');
        const { dirty } = yield select(state => state.posts);
        if (dirty) yield false;
      }],
      '/:id/update': function* adminPostsUpdateAction() {
        // FIXME: Routing based on the result
        yield take([SUCCESS_STORE_POST, FAILURE_STORE_POST, CANCEL_STORE_POST]);
        yield put(updateDirty(false));
        yield '/admin/posts';
      },
      '/:id/delete': function* adminPostsDeleteAction() {
        // FIXME: Routing based on the result
        yield take([SUCCESS_DELETE_POST, FAILURE_DELETE_POST, CANCEL_DELETE_POST]);
        yield '/admin/posts';
      },
    }, function* adminPostsLeaveHook() {
      console.log('admin posts leave hook');
    }],
  }],
  '/about': About,
};

function* cancel() {
  yield put(cancelFetchPosts());
}

const offset = '/blog';
export const interceptor = createMiddleware();

export default function* routesSaga(): Generator<IOEffect,void,*> {
  const history = createBrowserHistory();
  const channels = { middleware: interceptor.channel };
  yield fork(router, { history, routes, initial: Loading, cancel, channels, offset });
}
