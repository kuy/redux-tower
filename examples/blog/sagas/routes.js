// @flow

import { put, call, fork, take, cancelled } from 'redux-saga/effects';
import { createBrowserHistory, actions } from '../../../src/index';
import router from '../../../src/saga';
import { loadPosts, loadPost } from './posts';
import {
  SUCCESS_STORE_POSTS, FAILURE_STORE_POSTS, CANCEL_STORE_POSTS,
  SUCCESS_LOGIN, FAILURE_LOGIN,
  cancelFetchPosts
} from '../actions';

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import About from '../pages/about';
import Loading from '../pages/loading';
import UsersLogin from '../pages/users/login';
import AdminPostsIndex from '../pages/admin/posts/index';
import AdminPostsEdit from '../pages/admin/posts/edit';

import type { IOEffect } from 'redux-saga/effects';

const routes = {
  '/': '/posts',
  '/posts': {
    '/': function* postsIndexPage({ query }) {
      yield call(loadPosts, query);
      yield put(actions.changeComponent(PostsIndex));
    },
    '/:id': function* postsShowPage({ params: { id } }) {
      yield call(loadPost, id);
      yield put(actions.changeComponent(PostsShow));
    },
  },
  '/users': {
    '/login': {
      '/': UsersLogin,
      '/processing': function* adminLoginProcessingAction() {
        const { type } = yield take([SUCCESS_LOGIN, FAILURE_LOGIN]);
        if (type === SUCCESS_LOGIN) {
          yield put(actions.changeComponent(Loading));
          yield put(actions.replace(`/admin/posts`));
        } else {
          yield put(actions.replace(`/users/login`));
        }
      },
    },
  },
  '/admin': [function* adminEnterHook() {
    console.log('admin enter hook');
    if (true) {
      yield put(actions.replace(`/users/login`));
    }
  }, {
    '/posts': [function* adminPostsEnterHook() {
      console.log('admin posts enter hook');
    }, {
      '/': function* adminPostsIndexPage({ query }) {
        query.limit = 10;
        yield call(loadPosts, query);
        yield put(actions.changeComponent(AdminPostsIndex));
      },
      '/:id/edit': function* adminPostsEditPage({ params: { id } }) {
        yield call(loadPost, id);
        yield put(actions.changeComponent(AdminPostsEdit));
      },
      '/:id/update': function* adminPostsUpdateAction() {
        // FIXME: Routing based on the result
        yield take([SUCCESS_STORE_POSTS, FAILURE_STORE_POSTS, CANCEL_STORE_POSTS]);
        yield put(actions.replace(`/admin/posts`));
      },
    }, function* adminPostsLeaveHook() {
      console.log('admin posts leave hook');
    }],
  }, function* adminLeaveHook() {
    console.log('admin leave hook');
  }],
  '/about': About,
};

function* cancel() {
  yield put(cancelFetchPosts());
}

export default function* routesSaga(): Generator<IOEffect,void,*> {
  const history = createBrowserHistory();
  yield fork(router, { history, routes, initial: Loading, cancel });
}
