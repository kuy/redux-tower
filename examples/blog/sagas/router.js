import { put, call, fork } from 'redux-saga/effects';
import { router, createBrowserHistory, changePage } from '../../../src/index';
import createLink from '../../../src/react/link';
import { loadPosts, loadPost } from './index';

const history = createBrowserHistory();
export const Link = createLink(history);

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import About from '../pages/about';

const routes = {
  '/': '/posts',
  '/posts': function* postsIndexPage({ query }) {
    console.log(`posts.index`, query);
    yield call(loadPosts, query);
    yield put(changePage(PostsIndex));
  },
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    console.log(`posts.show.${id}`);
    yield call(loadPost, id);
    yield put(changePage(PostsShow));
  },
  '/about': About,
};

export default function* routerSaga() {
  yield fork(router, history, routes);
}
