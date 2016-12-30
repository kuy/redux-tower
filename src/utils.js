import qs from 'querystring';

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
  return func.prototype && typeof func.prototype.isReactComponent !== 'undefined';
}
