import { INIT, CHANGE_COMPONENT, UPDATE_PATH_INFO } from './actions';

const initial = {
  component: undefined,
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
    case CHANGE_COMPONENT:
      return { ...state, component: payload };
    case UPDATE_PATH_INFO:
      return { ...state, ...payload };
    default:
      return state;
  }
}
