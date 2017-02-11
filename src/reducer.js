import { INIT, CHANGE_ELEMENT, UPDATE_PATH_INFO } from './actions';

const initial = {
  element: undefined,
  path: undefined,
  params: undefined,
  query: undefined,
  splats: undefined,
  route: undefined,
  offset: undefined,
};

// FIXME: Assuming fixed reducer/state name 'router'
export const getOffset = state => state.router.offset;

export default function routerReducer(state = initial, { type, payload }) {
  switch (type) {
  case INIT:
    return { ...state, ...payload };
  case CHANGE_ELEMENT:
    return { ...state, element: payload };
  case UPDATE_PATH_INFO:
    return { ...state, ...payload };
  default:
    return state;
  }
}
