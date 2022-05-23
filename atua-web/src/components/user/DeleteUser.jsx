// User deletion component

// TODO: Improve style
// TODO: Improve field validation

import React, { useContext, useState } from "react";

import DeleteUserForm from "./sub/delete_user/DeleteUserForm";
import { UserContext } from "../../context/UserContext";
import { ModalContext } from "../../context/ModalContext";
import { useTranslation } from "react-i18next";

const DeleteUser = () => {
  const { user, userActions } = useContext(UserContext);
  const { showAlertModal } = useContext(ModalContext);

  const [t] = useTranslation("shared");

  const [formData, setFormData] = useState({});

  // Input change sets state
  // Uses element ID to set field in formData object
  const handleInput = (evt) => {
    const target = evt.target;
    const { id, value } = target;

    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Form submit function
  // Basic fields validation (completion)
  const handleDeleteUserFormSubmit = (evt) => {
    evt.preventDefault();

    const { current_password } = formData;

    // If field is complete calls Redux function for deletion
    if (current_password && current_password !== "") {
      userActions.deleteUser(formData, user.user.id);

      evt.target.reset();
    } else if (!current_password || current_password === "") {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.generic_error_title"),

        body: t("alert_modal.alerts.fail.field_missing"),
      });
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.generic_error_title"),

        body: t("alert_modal.alerts.fail.unexpected_error"),
      });
    }
  };

  return (
    <DeleteUserForm
      handleInput={handleInput}
      handleSubmit={handleDeleteUserFormSubmit}
    />
  );
};

export default DeleteUser;
