import 'babel-polyfill';
import test from 'ava';
import { Component } from 'react';
import * as saga from '../saga';

class Page extends Component {}

test('preprocess', t => {
  let routes = {
    '/top': '/home',
    '/': Page,
    '/home': '/',
  };
  let actual = saga.preprocess(routes);
  t.is(actual['/top'], actual['/']);
  t.true(typeof actual['/'].prototype.isReactComponent === 'undefined');
  t.is(actual['/home'], actual['/']);

  routes = {
    '/circular': '/routing',
    '/routing': '/circular',
  };
  let error = t.throws(() => {
    saga.preprocess(routes);
  });
  t.is(error.message, "Detected circular reference in '/routing'");

  // TODO: 3 or more circular references: /a -> /b -> /c -> /a

  routes = {
    '/me': '/me',
  };
  error = t.throws(() => {
    saga.preprocess(routes);
  });
  t.is(error.message, "Detected circular reference in '/me'");
});
