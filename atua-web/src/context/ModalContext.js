import React, { createContext, useReducer } from "react";

import modalReducer from "./reducers/modalReducer";
import {
  SHOW_ALERT_MODAL,
  HIDE_ALERT_MODAL,
  TOGGLE_LOADING_MODAL,
} from "./actionTypes";

export const ModalContext = createContext();

const state = {
  alert: false,
  loading: false,
  content: {},
};

const ModalContextProvider = (props) => {
  const [modal, dispatch] = useReducer(modalReducer, state);

  const showAlertModal = (content) => {
    dispatch({ type: SHOW_ALERT_MODAL, payload: content });

    document.getElementsByTagName("body")[0].classList.add("_no_scroll");
  };

  const hideAlertModal = () => {
    dispatch({ type: HIDE_ALERT_MODAL });

    document.getElementsByTagName("body")[0].classList.remove("_no_scroll");
  };

  const loadingOn = () => {
    dispatch({ type: TOGGLE_LOADING_MODAL, payload: true });

    document.getElementsByTagName("body")[0].classList.add("_no_scroll");
  };

  const loadingOff = () => {
    dispatch({ type: TOGGLE_LOADING_MODAL, payload: false });

    document.getElementsByTagName("body")[0].classList.remove("_no_scroll");
  };

  const toggleLoadingModal = {
    on: loadingOn,
    off: loadingOff,
  };

  return (
    <ModalContext.Provider
      value={{ modal, showAlertModal, hideAlertModal, toggleLoadingModal }}
    >
      {props.children}
    </ModalContext.Provider>
  );
};

export default ModalContextProvider;
