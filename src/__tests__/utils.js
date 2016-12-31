import test from 'ava';
import { Component } from 'react';
import * as utils from '../utils';

test('normOffset', t => {
  t.is(utils.normOffset('blog'), '/blog');
  t.is(utils.normOffset('/blog/'), '/blog');
  t.is(utils.normOffset('blog/'), '/blog');
  t.is(utils.normOffset('/blog'), '/blog');
});

test('removeOffset', t => {
  t.is(utils.removeOffset('/my-first-blog/categories/1', '/my-first-blog'), '/categories/1');
  t.is(utils.removeOffset('/my/my-first-blog/categories/1', '/my'), '/my-first-blog/categories/1');
  t.is(utils.removeOffset('/my-first-blog/categories/1', '/my'), '/my-first-blog/categories/1');
  t.is(utils.removeOffset('/my/', '/my'), '/');
  t.is(utils.removeOffset('/my', '/my'), '/');
  t.is(utils.removeOffset('/categories/1', '/my-first-blog'), '/categories/1');
});

test('parseQueryString', t => {
  t.deepEqual(utils.parseQueryString('?q=keyword'), { q: 'keyword' });
  t.deepEqual(utils.parseQueryString('q=keyword'), { q: 'keyword' });
  t.deepEqual(utils.parseQueryString('?q='), { q: '' });
  t.deepEqual(utils.parseQueryString('?a=1&b=2&c=3'), { a: '1', b: '2', c: '3' });
});

test('upperFirst', t => {
  t.is(utils.upperFirst('first'), 'First');
});

test('toCamelCase', t => {
  t.is(utils.toCamelCase('REDUX_SAGA_TOWER'), 'reduxSagaTower');
});

test('isReactComponent', t => {
  class Page extends Component {}
  t.true(utils.isReactComponent(Page));
  class Klass {}
  t.false(utils.isReactComponent(Klass));
  t.false(utils.isReactComponent(function*(){}));
  t.false(utils.isReactComponent(function(){}));
  t.false(utils.isReactComponent(() => {}));
});
