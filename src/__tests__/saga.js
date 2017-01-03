import test from 'ava';
import { Component } from 'react';
import { put, select, call } from 'redux-saga/effects';
import { createMemoryHistory } from 'history';
import * as saga from '../saga';
import * as actions from '../actions';
import { ERROR, CANCEL } from '../preprocess';

function isChannel(obj) {
  return typeof obj.take === 'function'
    && typeof obj.flush === 'function'
    && typeof obj.close === 'function';
}

class Index extends Component {}
class Login extends Component {}
class Hoge extends Component {}
class Dashboard extends Component {}
class Edit extends Component {}
class NotFound extends Component {}

function createTower(routes) {
  const offset = '';
  const matcher = saga.createMatcher(routes);
  const history = createMemoryHistory();
  return { tower: saga.theControlTower({ history, matcher, offset }), history };
}

test('theControlTower - basic', t => {
  const routes = {
    '/': Index,
    '/hoge': Hoge,
  };
  const { tower } = createTower(routes);
  const sagas = [tower];

  let ret = sagas[0].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: { type: '@@redux-tower/PUSH', payload: ['/'] },
  });

  // Wait location change
  ret = sagas[0].next();
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/hoge'
  ret = sagas[0].next({ pathname: '/hoge', search: '' });
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: "/hoge", params: {}, query: {}, splats: [], route: "/hoge" }
    },
  });

  // Launch runRouteAction
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  let args = ret.value.CALL.args;
  t.is(typeof args[0]._invoke, 'function');
  t.deepEqual(args[1], []);
  t.deepEqual(args[2], []);
  t.true(isChannel(args[4]));

  // Run main action
  sagas.push(saga.runRouteAction(...args));

  // Show Hoge page
  ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Hoge
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

function moveTo(iterator, pathname) {
  let ret = iterator.next();
  ret = iterator.next();
  ret = iterator.next({ pathname, search: '' });
  if (ret.value.PUT) {
    ret = iterator.next();
  }
  return saga.runRouteAction(...ret.value.CALL.args);
}

test('theControlTower - entering hooks', async t => {
  const isNotLoggedIn = () => {};
  const routes = {
    '/': Index,
    '/login': Login,
    '/admin': [function* enter() {
      if (yield select(isNotLoggedIn)) {
        yield '/login'; // Redirect
      }
    }, {
      '/': './dashboard',
      '/dashboard': Dashboard
    }],
  };
  const { tower, history } = createTower(routes);
  const sagas = [tower];

  // Run entering hook
  sagas.push(moveTo(sagas[0], '/admin'));

  // Login check
  let ret = sagas[1].next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isNotLoggedIn, args: [] } },
    done: false
  });

  // Redirect to '/login'
  ret = sagas[1].next(true); // result of isNotLoggedIn
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: { type: '@@redux-tower/REPLACE', payload: ['/login'] },
  });

  // Simulate: queue history event
  history.replace('/login');

  // Done entering hook, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: true, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Simulate: get queued value from history channel
  let val = await new Promise(resolve => {
    ret.value.TAKE.channel.take(loc => resolve(loc));
  });
  sagas[0].next(val);

  // Run main action
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Show Login page
  ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Login
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/admin' (try again)
  sagas[0].next({ pathname: '/admin', search: '' });

  // Run entering hook
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas[1] = saga.runRouteAction(...ret.value.CALL.args);

  // Login check
  ret = sagas[1].next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isNotLoggedIn, args: [] } },
    done: false
  });

  // Done entering hook, back to Tower
  ret = sagas[1].next(false); // result of isNotLoggedIn
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Run main action
  ret = sagas[0].next(ret.value);
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Show Dashboard page
  ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Dashboard
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

test('theControlTower - leaving hooks', t => {
  const isDirty = () => {};
  function* leave() {
    if (yield select(isDirty)) {
      yield false; // Prevent
    }
  }
  const routes = {
    '/': Index,
    '/posts': {
      '/:id/edit': [Edit, leave]
    },
  };
  const { tower } = createTower(routes);
  const sagas = [tower];

  // Run main action
  sagas.push(moveTo(sagas[0], '/posts/10/edit'));

  // Show Edit page
  let ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Edit
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [leave], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/'
  sagas[0].next({ pathname: '/', search: '' });

  // Run main action
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Run leaving hook
  ret = sagas[1].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Do dirty check
  ret = sagas[2].next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isDirty, args: [] } },
    done: false
  });

  // Prevented in leaving hook
  ret = sagas[2].next(true); // result of isDirty
  t.deepEqual(ret, { value: { prevented: true, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Done leaving hook, back to Tower
  ret = sagas[1].next(ret.value);
  t.deepEqual(ret, { value: { prevented: true, hooks: [leave], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/' (try again)
  sagas[0].next({ pathname: '/', search: '' });

  // Run main action
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Run leaving hook
  ret = sagas[1].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Do dirty check
  ret = sagas[2].next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isDirty, args: [] } },
    done: false
  });

  // Done leaving hook, back to main action
  ret = sagas[2].next(false); // result of isDirty
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Show Index page
  ret = sagas[1].next(ret.value);
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Index
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

test('theControlTower - cancel hook', async t => {
  const api = () => {};
  function* cancel() {
    yield put({ type: 'CANCEL' });
  }
  const routes = {
    '/': function* index() {
      yield call(api);
      yield Index;
    },
    '/hoge': Hoge,
    [CANCEL]: cancel,
  };
  const { tower, history } = createTower(routes);
  const sagas = [tower];

  // Run main action
  sagas.push(moveTo(sagas[0], '/'));

  // Race API call and location change
  let ret = sagas[1].next();
  let race = ret.value.RACE;
  t.deepEqual(race.main.CALL, {
    context: null,
    fn: api,
    args: [],
  });
  let channel = race.loc.TAKE.channel;
  t.true(isChannel(channel));

  // Simulate: fire location change event while API calling
  history.push('/hoge');

  // Simulate: get new location from history channel
  let val = await new Promise(resolve =>
    channel.take(loc => resolve(loc))
  );

  // Run cancel hook
  ret = sagas[1].next({ loc: val });
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Dispatch something from cancel hook
  ret = sagas[2].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: 'CANCEL'
    },
  });

  // Done cancel hook, back to runRouteAction
  ret = sagas[2].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Cancelled main action by location change, back to Tower
  ret = sagas[1].next(ret.value);
  t.true(ret.value.prevented);
  t.deepEqual(ret.value.hooks, []);
  t.is(ret.value.location.pathname, '/hoge');
  t.is(ret.value.location.search, '');
  t.is(ret.value.location.hash, '');
  t.is(ret.value.location.state, undefined);
  t.true(ret.done);

  sagas.pop();

  // Restart with new location '/hoge'
  sagas[0].next(ret.value);

  // Run main action
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Show Hoge page
  ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Hoge
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

test('theControlTower - error page', t => {
  const routes = {
    '/': Index,
    [ERROR]: NotFound,
  };
  const { tower } = createTower(routes);
  const sagas = [tower];

  // Run main action
  sagas.push(moveTo(sagas[0], '/not/exists/page'));

  // Show Error page
  let ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: NotFound
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

test('theControlTower - no error page', t => {
  const routes = {
    '/': Index,
  };
  const { tower } = createTower(routes);
  const sagas = [tower];

  // No matched route and No Error page
  // Wait location change
  let ret = sagas[0].next();
  ret = sagas[0].next();
  ret = sagas[0].next({ pathname: '/not/exists/page', search: '' });
  t.true(isChannel(ret.value.TAKE.channel));
});
