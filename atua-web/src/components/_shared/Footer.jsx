import React from "react";

import logoAtua from "../../assets/images/v1/ATUA_logo_v1.svg";

const Footer = () => {
  return (
    <footer className="container-fluid">
      <div className="row justify-content-center align-items-center px-2 py-3 _bg_secondary">
        <div className="col-12 col-md-auto mb-2 mb-md-0">
          <img src={logoAtua} alt="ATUA Logo" height="40px" />
        </div>
        {/* <div className="col-12 col-md-auto mb-2 mb-md-0">
          <a href="#">
            <i className="fab fa-facebook-square text-white"></i>
          </a>
        </div> */}
        {/* <div className="col-12 col-md-auto mb-2 mb-md-0">
          <a href="#">
            <i className="fab fa-twitter-square text-white"></i>
          </a>
        </div> */}
        <div className="col-12 col-md-auto mb-2 mb-md-0">
          <a
            href="https://www.instagram.com/atua.rentalcar/"
            className="text-white"
          >
            <i className="fab fa-instagram text-white mr-1"></i>
            Instagram
          </a>
        </div>
        <div className="col-12 col-md-auto mb-2 mb-md-0 ml-md-auto">
          <p className="text-white m-0">
            <i className="fab fa-whatsapp mr-1"></i>+54 9 11-3682-8601
          </p>
        </div>
        <div className="col-12 col-md-auto mb-md-0">
          <p className="text-white m-0">
            <i className="far fa-envelope mr-1"></i>
            support@atuarental.com
          </p>
        </div>
      </div>
      {/* Restore when Info is ready to be placed */}
      <div className="row py-4 _bg_black">
        {/* <div className="col-12 col-md-auto mb-2 mb-md-0">
          <p className="text-muted m-0">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut deserunt
            iste quam veritatis. Odit temporibus officiis quibusdam cumque.
          </p>
        </div>
        <div className="col-12 col-md-auto mb-2 mb-md-0">
          <p className="text-muted m-0">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut deserunt
            iste quam veritatis. Odit temporibus officiis quibusdam cumque.
          </p>
        </div>
        <div className="col-12 col-md-auto mb-2 mb-md-0">
          <p className="text-muted m-0">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut deserunt
            iste quam veritatis. Odit temporibus officiis quibusdam cumque.
          </p>
        </div>
        <div className="col-12 col-md-auto mb-2 mb-md-0">
          <p className="text-muted m-0">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut deserunt
            iste quam veritatis. Odit temporibus officiis quibusdam cumque.
          </p>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
