import React, { createContext, useReducer, useContext } from "react";

import { USER_LOADING, GET_USER_INFO, REMOVE_USER_INFO } from "./actionTypes";

import {
  verificationCodeRequest,
  validateUserRequest,
  signUpUserRequest,
  logInUserRequest,
  refreshTokenRequest,
} from "../assets/scripts/requests/authRequests";

import {
  getUserInfoRequest,
  mainInfoUpdateRequest,
  profileInfoUpdateRequest,
  userAddressRequest,
  pinChangeRequest,
  deleteUserRequest,
  documentationRegisterRequest,
} from "../assets/scripts/requests/userRequests";

import { storage } from "../assets/scripts/idbAccess";

import userReducer from "./reducers/userReducer";

import { ModalContext } from "./ModalContext";

import { useHistory } from "react-router-dom";

import { useTranslation } from "react-i18next";

export const UserContext = createContext();

const state = {
  logged: false,
  user: {},
  loading: false,
};

const UserContextProvider = (props) => {
  const [user, dispatch] = useReducer(userReducer, state);

  const [t] = useTranslation("shared");

  const { showAlertModal, toggleLoadingModal } = useContext(ModalContext);

  const history = useHistory();

  //Actions
  //Requests for auth and user info management, to be moved when learnt how to :p

  //AUTH ACTIONS

  const codeRequest = async (formData) => {
    let codeRequest = await verificationCodeRequest(formData);

    return codeRequest;
  };

  const validateUser = async (formData) => {
    toggleLoadingModal.on();

    let userValidation = await validateUserRequest(formData);

    toggleLoadingModal.off();

    return userValidation;
  };

  const signUp = async (formData) => {
    toggleLoadingModal.on();

    let sign = await signUpUserRequest(formData);

    if (sign.ok) {
      showAlertModal({
        isAlert: false,
        title: t("alert_modal.alerts.success.created_account_title"),
        body: t("alert_modal.alerts.success.created_account_body"),
        redirect: "/authorization/log_in",
      });
    } else {
      const error = await sign.json();

      console.log(error);

      let body = "";
      //Replace or add exceptions and errors when doc is available
      //Messages are held in "shared"translation files
      if (error.code_transaction === "ERROR_SERVER") {
        body += error.message;
      }

      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.register_failure_title"),
        body: body,
      });
    }
  };

  const logIn = async (formData) => {
    toggleLoadingModal.on();

    const login = await logInUserRequest(formData);

    if (login.ok) {
      let tokens = await login.json();

      //Token storage
      await storage.db
        .collection("auth")
        .add({ token: tokens.data.access }, "access");

      await storage.db
        .collection("auth")
        .add({ token: tokens.data.refresh }, "refresh");

      toggleLoadingModal.off();

      // Get user info
      getInfo(tokens.data.access);

      // Redirect to Landing
      history.push("/");
    } else {
      //IMPROVE ERROR HANDLING ONCE RESPONSE EXAMPLES ARE AVAILABLE
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.access_failure_title"),
        body: t("alert_modal.alerts.fail.access_failure_body"),
      });
    }
  };

  //  User Log out
  const logOut = async () => {
    //Remove token data from IDB
    await storage.db.collection("auth").delete();
    // Remove state info
    dispatch({ type: REMOVE_USER_INFO });
    // Uncomment when needed
    // removeCarsInfo()

    showAlertModal({
      isAlert: false,
      title: t("alert_modal.alerts.success.log_out_title"),
      body: t("alert_modal.alerts.success.log_out_body"),
      redirect: "/",
    });
  };

  // Updates access token using refresh token
  const refreshToken = async () => {
    const refreshToken = await storage.db
      .collection("auth")
      .doc("refresh")
      .get()
      .then((refresh) => refresh.token);

    if (refreshToken) {
      const refreshRequest = await refreshTokenRequest(refreshToken);

      if (refreshRequest.ok) {
        const newToken = await refreshRequest.json();

        await storage.db
          .collection("auth")
          .doc("access")
          .set({ token: newToken.data.access });

        getInfo(true);
      } else {
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.invalid_refresh_token_title"),
          body: t("alert_modal.alerts.fail.invalid_token_body"),
          redirect: "/",
        });

        await storage.db.collection("auth").doc("refresh").delete();

        await storage.db.collection("auth").doc("access").delete();

        return;
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.generic_error_title"),
        body: t("alert_modal.alerts.fail.not_a_user"),
        redirect: "/authorization/log_in",
      });
    }
  };

  // USER ACTIONS
  // Get token, format data and make request
  // Send Data / Request and Store / Alert or Notify

  //User info request and data storage
  const getInfo = async (refresh = false) => {
    //Bypass multiple requests if user is already logged and browsing the app. Check for better solution
    if (user.logged && !refresh) return;

    dispatch({ type: USER_LOADING });

    toggleLoadingModal.on();

    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    const infoRequest = await getUserInfoRequest(token);

    switch (infoRequest.status) {
      case 200:
        const userInfo = await infoRequest.json();

        dispatch({ type: GET_USER_INFO, payload: userInfo.data });

        toggleLoadingModal.off();
        break;

      case 401:
        await refreshToken();
        break;

      case 500:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.service_unavailable"),
        });

        break;

      default:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.failed_user_data_fetch"),
        });
        break;
    }
  };

  // Pin Change from Profile
  const pinChange = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    const request = await pinChangeRequest(formData, token);

    switch (request.status) {
      case 200:
        showAlertModal({
          isAlert: false,
          title: t("alert_modal.alerts.success.generic_success_title"),
          body: t("alert_modal.alerts.success.pin_changed"),
        });

        getInfo(true);
        break;

      case 400:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.pin_does_not_match"),
        });
        break;

      default:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.pin_change_unsuccessful"),
        });
        break;
    }
  };

  // Register user ID in profile
  const documentationRegister = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    console.log("context", formData);

    const request = await documentationRegisterRequest(token, formData);

    switch (request.status) {
      case 200:
        showAlertModal({
          isAlert: false,
          title: t("alert_modal.alerts.success.generic_success_title"),
          body: t(
            "alert_modal.alerts.success.documentation_register_successful"
          ),
        });

        getInfo(true);
        break;

      case 400:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.documentation_register_failed"),
        });
        break;

      default:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.unexpected_error"),
        });
        break;
    }
  };

  const addressRegister = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    const request = await userAddressRequest(token, formData);

    switch (request.status) {
      case 200:
        showAlertModal({
          isAlert: false,
          title: t("alert_modal.alerts.success.generic_success_title"),
          body: t("alert_modal.alerts.success.changes_successful"),
        });

        getInfo(true);
        break;

      case 400:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.changes_unsuccessful"),
        });
        break;

      case 500:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.unexpected_error"),
        });
        break;

      default:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.unexpected_error"),
        });
        break;
    }
  };

  // OLD - LEFT AS REFERENCE *********************

  const mainInfoUpdate = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      toggleLoadingModal.on();

      const infoUpdate = await mainInfoUpdateRequest(token, formData);

      if (infoUpdate.ok) {
        showAlertModal({
          isAlert: false,
          title: t("alert_modal.alerts.success.generic_success_title"),
          body: t("alert_modal.alerts.success.changes_successful"),
          redirect: "/user/profile",
        });

        getInfo(token);
      } else {
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.failed_user_data_fetch"),
          redirect: "/user/profile",
        });

        getInfo(token);
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.generic_error_title"),
        body: t("alert_modal.alerts.fail.not_a_user"),
        redirect: "/authorization/log_in",
      });
    }
  };

  // OLD - LEFT AS REFERENCE
  //User non registry info update (address, id, license)
  //If address creation, send true
  //if address update, send id
  const profileInfoUpdate = async (
    formData,
    birthDate,
    createAddress = false,
    addressId = false
  ) => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    //if is logged user
    if (token) {
      let info = formData;

      toggleLoadingModal.on();

      //if it's an address creation, it will create the addres and procceed to
      // make the info update as normal with new info
      if (createAddress) {
        const addressCreate = await userAddressRequest(token, formData);

        if (addressCreate.ok) {
          const newAddress = await addressCreate.json();

          const createdAddressId = newAddress.id;

          info = {
            address: createdAddressId,
          };
        } else {
          showAlertModal({
            isAlert: true,
            title: t("alert_modal.alerts.fail.generic_error_title"),
            body: t("alert_modal.alerts.fail.failed_user_data_fetch"),
            redirect: "/user/profile",
          });

          getInfo(token);

          return;
        }
      }

      //if it's an address update, it will update the address and break from info update
      // as address is a separate object somewhere else
      if (addressId) {
        const addressUpdate = await userAddressRequest(
          token,
          formData,
          addressId
        );

        if (addressUpdate.ok) {
          showAlertModal({
            isAlert: false,
            title: t("alert_modal.alerts.success.generic_success_title"),
            body: t("alert_modal.alerts.success.changes_successful"),
            redirect: "/user/profile",
          });

          getInfo(token);

          //As no further step is needed, it breaks here
          return;
        } else {
          showAlertModal({
            isAlert: true,
            title: t("alert_modal.alerts.fail.generic_error_title"),
            body: t("alert_modal.alerts.fail.failed_user_data_fetch"),
            redirect: "/user/profile",
          });

          getInfo(token);
          return;
        }
      }

      // This step is the actual profile update
      const profileInfoUpdate = await profileInfoUpdateRequest(token, {
        ...info,
        date_of_birth: birthDate,
      });

      if (profileInfoUpdate.ok) {
        showAlertModal({
          isAlert: false,
          title: t("alert_modal.alerts.success.generic_success_title"),
          body: t("alert_modal.alerts.success.changes_successful"),
          redirect: "/user/profile",
        });

        getInfo(token);
      } else {
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.failed_user_data_fetch"),
          redirect: "/user/profile",
        });

        getInfo(token);
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.generic_error_title"),
        body: t("alert_modal.alerts.fail.not_a_user"),
        redirect: "/authorization/log_in",
      });
    }
  };

  const deleteUser = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    //if user is logged
    if (token) {
      toggleLoadingModal.on();

      const request = await deleteUserRequest(formData, user.user.id, token);

      if (request.ok) {
        showAlertModal({
          isAlert: false,
          title: t("alert_modal.alerts.success.deleted_account_title"),
          body: t("alert_modal.alerts.success.deleted_account_body"),
          redirect: "/",
        });

        // Remove token
        storage.db.collection("auth").doc("token").delete();

        dispatch({ type: REMOVE_USER_INFO });
      } else {
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.account_deletion_failure"),
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.generic_error_title"),
        body: t("alert_modal.alerts.fail.not_a_user"),
        redirect: "/authorization/log_in",
      });
    }
  };

  const authActions = {
    codeRequest,
    validateUser,
    signUp,
    logIn,
    refreshToken,
    logOut,
  };

  const userActions = {
    getInfo,
    pinChange,
    documentationRegister,
    addressRegister,
    mainInfoUpdate,
    profileInfoUpdate,
    deleteUser,
  };

  return (
    <UserContext.Provider
      value={{
        user,
        authActions,
        userActions,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
