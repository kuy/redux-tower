import { INIT, CHANGE_PAGE, UPDATE_PATH_INFO } from './actions';

const initial = {
  page: undefined,
  path: undefined,
  params: undefined,
  query: undefined,
  splats: undefined,
  route: undefined,
  offset: undefined,
};

export default function routerReducer(state = initial, { type, payload }) {
  switch (type) {
    case INIT:
      return { ...state, ...payload };
    case CHANGE_PAGE:
      return { ...state, page: payload };
    case UPDATE_PATH_INFO:
      return { ...state, ...payload };
    default:
      return state;
  }
}
