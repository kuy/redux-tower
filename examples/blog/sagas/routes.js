// @flow

import React from 'react';
import { put, call, fork, take, select } from 'redux-saga/effects';
import { createBrowserHistory, saga as router, CANCEL, ERROR, INITIAL } from '../../../src/index';
import { loadPosts, loadPost } from './posts';
import {
  SUCCESS_CREATE_POST, FAILURE_CREATE_POST, CANCEL_CREATE_POST,
  SUCCESS_STORE_POST, FAILURE_STORE_POST, CANCEL_STORE_POST,
  SUCCESS_DELETE_POST, FAILURE_DELETE_POST, CANCEL_DELETE_POST,
  SUCCESS_LOGIN, FAILURE_LOGIN, SUCCESS_LOGOUT, FAILURE_LOGOUT,
  cancelFetchPosts, updateDirty
} from '../actions';
import { isLoggedIn, isDirty } from '../reducers';

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import UsersLogin from '../pages/users/login';
import AdminPostsIndex from '../pages/admin/posts/index';
import AdminPostsNew from '../pages/admin/posts/new';
import AdminPostsEdit from '../pages/admin/posts/edit';
import Loading from '../pages/loading';
import NotFound from '../pages/not-found';

import type { IOEffect } from 'redux-saga/effects';

const routes = {
  [INITIAL]: <Loading />,
  '/': '/posts',
  '/posts': {
    '/': function* postsIndexPage({ query }) {
      yield call(loadPosts, query);
      yield <PostsIndex />;
    },
    '/:id': function* postsShowPage({ params: { id } }) {
      yield call(loadPost, id);
      yield <PostsShow />;
    },
  },
  '/users': {
    '/login': {
      '/': <UsersLogin />,
      '/processing': function* usersLoginProcessingAction() {
        const { type } = yield take([SUCCESS_LOGIN, FAILURE_LOGIN]);
        if (type === SUCCESS_LOGIN) {
          yield <Loading />;
          yield '/admin/posts';
        } else {
          yield '/users/login';
        }
      },
    },
    '/logout': function* usersLogoutAction() {
      const { type } = yield take([SUCCESS_LOGOUT, FAILURE_LOGOUT]);
      if (type === SUCCESS_LOGOUT) {
        yield <Loading />;
        yield '/';
      } else {
        // NOTE: Already logged-out?
      }
    },
  },
  '/admin': [function* adminEnterHook() {
    console.log('admin enter hook');
    if (!(yield select(isLoggedIn))) {
      yield '/users/login';
    }
  }, {
    '/posts': [function* adminPostsEnterHook() {
      console.log('admin posts enter hook');
    }, {
      '/': function* adminPostsIndexPage({ query }) {
        query.limit = 10;
        yield call(loadPosts, query);
        yield <AdminPostsIndex />;
      },
      '/new': <AdminPostsNew />,
      '/create': function* adminPostsCreateAction() {
        // FIXME: Routing based on the result
        yield take([SUCCESS_CREATE_POST, FAILURE_CREATE_POST, CANCEL_CREATE_POST]);
        yield '/admin/posts';
      },
      '/:id/edit': [function* adminPostsEditPage({ params: { id } }) {
        yield call(loadPost, id);
        yield <AdminPostsEdit />;
      }, function* adminPostsEditLeaveHook() {
        console.log('admin posts edit leave hook');
        if (yield select(isDirty)) yield false;
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
  '/about': '/posts/5',
  [ERROR]: <NotFound />,
  [CANCEL]: function* cancel() {
    yield put(cancelFetchPosts());
  }
};

export default function* routesSaga(): Generator<IOEffect,void,*> {
  const offset = '/blog';
  const history = createBrowserHistory();
  yield fork(router, { history, routes, offset });
}
