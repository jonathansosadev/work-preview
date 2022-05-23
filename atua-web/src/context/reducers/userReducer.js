import { USER_LOADING, GET_USER_INFO, REMOVE_USER_INFO } from "../actionTypes";

export default function userReducer(state, { type, payload }) {
  switch (type) {
    case USER_LOADING:
      return { ...state, loading: true };

    case GET_USER_INFO:
      return { ...state, logged: true, user: payload, loading: false };

    case REMOVE_USER_INFO:
      return { ...state, logged: false, user: {}, loading: false };

    default:
      return state;
  }
}
