export const INIT_PAGE = '@@redux-saga-tower/INIT_PAGE';
export const CHANGE_PAGE = '@@redux-saga-tower/CHANGE_PAGE';
export const UPDATE_PATH_INFO = '@@redux-saga-tower/UPDATE_PATH_INFO';

export const initPage = payload => ({ type: INIT_PAGE, payload });
export const changePage = payload => ({ type: CHANGE_PAGE, payload });
export const updatePathInfo = payload => ({ type: UPDATE_PATH_INFO, payload });
