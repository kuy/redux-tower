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

// FIXME: Assuming fixed reducer/state name 'router'
export const getOffset = state => state.router.offset;

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
