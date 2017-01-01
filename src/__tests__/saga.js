import 'babel-polyfill';
import test from 'ava';
import { Component } from 'react';
import { put } from 'redux-saga/effects';
import { createMemoryHistory } from 'history';
import * as saga from '../saga';
import * as actions from '../actions';

function isChannel(obj) {
  return typeof obj.take === 'function'
    && typeof obj.flush === 'function'
    && typeof obj.close === 'function';
}

test('theControlTower', t => {
  class Index extends Component {}
  class Hoge extends Component {}
  const routes = {
    '/': Index,
    '/hoge': Hoge,
  };
  const offset = '';
  const matcher = saga.createMatcher(routes);
  const history = createMemoryHistory();
  const i = saga.theControlTower({ history, matcher, offset });

  let ret = i.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: { type: '@@redux-tower/PUSH', payload: ['/'] },
  });

  // Wait location change
  ret = i.next();
  t.true(isChannel(ret.value.TAKE.channel));

  // Push new location '/hoge'
  ret = i.next({ pathname: '/hoge', search: '' });
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: "/hoge", params: {}, query: {}, splats: [], route: "/hoge" }
    },
  });

  // Launch runRouteAction
  ret = i.next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  let args = ret.value.CALL.args;
  t.is(typeof args[0]._invoke, 'function');
  t.deepEqual(args[1], []);
  t.deepEqual(args[2], []);
  t.is(args[3], undefined);
  t.true(isChannel(args[4]));

  // Dive into runRouteAction
  const a = saga.runRouteAction(...args);

  // Dispatch CHANGE_COMPONENT action
  ret = a.next();
  let action = ret.value.PUT.action;
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Hoge
    },
  });

  // Done, back to theControlTower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});
