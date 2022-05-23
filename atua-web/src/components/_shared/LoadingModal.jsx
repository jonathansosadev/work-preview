import React, { useContext } from "react";

import { ModalContext } from "../../context/ModalContext";

import LoadingModalLayout from "./LoadingModalLayout";

const LoadingModal = () => {
  const {
    modal: { loading },
  } = useContext(ModalContext);

  // Rendered this way as it's  "Always present" opposed to call the element or not at all
  return loading ? <LoadingModalLayout /> : null;
};

export default LoadingModal;
