import { Component } from 'react';
import qs from 'querystring';
import { PUSH, REPLACE, CHANGE_ELEMENT } from './actions';

export function normOffset(offset) {
  if (typeof offset === 'undefined') return;
  if (offset.indexOf('/') !== 0) {
    offset = '/' + offset
  }
  if (offset.lastIndexOf('/') === offset.length - 1) {
    offset = offset.slice(0, offset.length - 1);
  }
  return offset;
}

// offset: normalized offset
export function removeOffset(pathname, offset) {
  if (pathname.indexOf(offset + '/') === 0) {
    pathname = pathname.replace(offset, '');
  } else if (pathname === offset) {
    pathname = '/';
  }
  return pathname;
}

export function parseQueryString(search) {
  if (search.indexOf('?') === 0) {
    search = search.slice(1);
  }
  return qs.parse(search);
}

export function upperFirst(word) {
  if (typeof word !== 'string' || word.length === 0) return word;
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export function toCamelCase(SNAKE_CASE) {
  const words = SNAKE_CASE.split('_');
  return [words[0].toLowerCase(), ...words.slice(1).map(upperFirst)].join('');
}

export function isReactComponent(func) {
  return func.prototype instanceof Component;
}

// https://redux-saga.github.io/redux-saga/docs/api/index.html#blocking--nonblocking
const EFFECT_TYPES = ['TAKE', 'CALL', 'APPLY', 'CPS', 'JOIN', 'CANCEL', 'FLUSH', 'CANCELLED', 'RACE'];
export function isBlock(effect) {
  return EFFECT_TYPES.map(type => !!effect[type]).reduce((p, c) => p || c, false);
}

export function isPut(effect, type) {
  return !!(effect.PUT && effect.PUT.action && effect.PUT.action.type === type);
}

export function isPrevent(e) {
  return isPut(e, CHANGE_ELEMENT) || isPut(e, PUSH) || isPut(e, REPLACE);
}
