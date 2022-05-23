import {
  SHOW_ALERT_MODAL,
  HIDE_ALERT_MODAL,
  TOGGLE_LOADING_MODAL,
} from "../actionTypes";

export default function modalReducer(state, { type, payload }) {
  switch (type) {
    case SHOW_ALERT_MODAL:
      return { ...state, alert: true, loading: false, content: payload };

    case HIDE_ALERT_MODAL:
      return { ...state, alert: false, content: {} };

    case TOGGLE_LOADING_MODAL:
      return { ...state, loading: payload };

    default:
      return state;
  }
}
