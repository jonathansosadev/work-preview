//Base container
//holds header, footer, switch and router

import React, { Suspense } from "react";

import { BrowserRouter as Router } from "react-router-dom";

import ModalContextProvider from "./context/ModalContext";
import UserContextProvider from "./context/UserContext";

import Header from "./components/_shared/Header";
import Footer from "./components/_shared/Footer";
import AlertModal from "./components/_shared/AlertModal";
import LoadingModal from "./components/_shared/LoadingModal";
import LoadingModalLayout from "./components/_shared/LoadingModalLayout";

import Switch from "./components/_shared/Switch";

const App = () => {
  return (
    <div className="App">
      <Suspense fallback={<LoadingModalLayout />}>
        <Router>
          <ModalContextProvider>
            <UserContextProvider>
              <Header />
              <Switch />
              <Footer />
              <AlertModal />
              <LoadingModal />
            </UserContextProvider>
          </ModalContextProvider>
        </Router>
      </Suspense>
    </div>
  );
};

export default App;
