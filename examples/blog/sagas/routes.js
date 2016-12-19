import { put, call, fork } from 'redux-saga/effects';
import { createBrowserHistory, actions } from '../../../src/index';
import router from '../../../src/saga';
import createLink from '../../../src/react/create-link';
import { loadPosts, loadPost } from './index';
import Loading from '../pages/loading';

export const history = createBrowserHistory();
export const Link = createLink(history);

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import About from '../pages/about';

const routes = {
  '/': '/posts',
  '/posts': function* postsIndexPage({ query }) {
    yield call(loadPosts, query);
    yield put(actions.changeComponent(PostsIndex));
  },
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    yield call(loadPost, id);
    yield put(actions.changeComponent(PostsShow));
  },
  '/about': About,
};

export default function* routesSaga() {
  yield fork(router, history, routes, Loading);
}
