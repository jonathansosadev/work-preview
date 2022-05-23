import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

import "./assets/css/general-style-v1.css";
import "./assets/css/landing-page-v1.css";
import "./assets/css/access-forms-v1.css";
import "./assets/css/profile-v1.css";
import "./assets/css/car-register-v1.css";
import "./assets/css/rental-v1.css";
import "./assets/css/user-garage-v1.css";
import "./assets/css/faq-v1.css";

import * as serviceWorker from "./serviceWorker";

import "./assets/scripts/idbAccess";

import "./i18n";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

//Service worker needs to be properly adjusted
serviceWorker.unregister();
