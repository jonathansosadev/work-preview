import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import { ModalContext } from "../../context/ModalContext";
import { useTranslation } from "react-i18next";

import warning from "../../assets/images/v1/alert_icon.svg";
import notification from "../../assets/images/v1/notification_icon.svg";

const AlertModal = () => {
  const {
    modal: { alert, content },
    hideAlertModal,
  } = useContext(ModalContext);

  const history = useHistory();

  const [t] = useTranslation("shared");

  // Closing function
  // Uses redirect link in state in case modal should redirect on close
  const closeModal = () => {
    hideAlertModal();

    if (content.redirect) {
      history.replace(content.redirect);
    }
  };

  const modalIcon = () => {
    return content.isAlert ? (
      <img src={warning} alt="Warning" width="75%" />
    ) : (
      <img src={notification} alt="notification" width="75%" />
    );
  };

  // Rendered this way as it's  "Always present" opposed to call the element or not at all
  return alert ? (
    <div
      className="row justify-content-center _modal_container"
      onClick={closeModal}
    >
      <section className="col-9 col-md-4 my-auto">
        <div className="row justify-content-center _modal_header">
          <div className="col-3 p-2 p-md-4 text-center _bg_primary _border_top_left">
            {modalIcon()}
          </div>
          <div className="col-9 p-1 p-md-4 _bg_primary _border_top_right">
            <h4 className="text-right text-white font-weight-bold">
              {content.title}
            </h4>
          </div>
        </div>

        <div className="row justify-content-start p-2 _bg_tertiary _modal_body">
          <div className="col-auto p-1 p-md-2">
            <p>{content.body}</p>
          </div>
        </div>

        <div className="row justify-content-end rounded-bottom p-2 _bg_tertiary ">
          <div className="col-auto p-1 p-md-2">
            <button
              type="button"
              className="btn _back_button"
              onClick={closeModal}
            >
              {t("alert_modal.button")}
            </button>
          </div>
        </div>
      </section>
    </div>
  ) : null;
};

export default AlertModal;
