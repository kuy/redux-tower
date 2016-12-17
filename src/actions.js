export const INIT_PAGE = 'INIT_PAGE';
export const CHANGE_PAGE = 'CHANGE_PAGE';
export const initPage = payload => ({ type: INIT_PAGE, payload });
export const changePage = payload => ({ type: CHANGE_PAGE, payload });

export const UPDATE_PATH_INFO = 'UPDATE_PATH_INFO';
export const updatePathInfo = payload => ({ type: UPDATE_PATH_INFO, payload });
