// Contact component
// Shows contact phone and mail
// Form for sending a message, not implemented

// MUST BE REDONE WHEN MESSAGING IS ENABLED

import React from "react";

const Contact = () => {
  return (
    <>
      <section className="container-md">
        <h1 className="text-center font-weight-bold mt-5 my-4 col-10 mx-auto">
          ¿Consultas? Contactate con nosotros
        </h1>
      </section>

      <section className="container">
        <h2 className="text-center font-weight-bold my-4 col-10 mx-auto">
          Envianos un mensaje
        </h2>

        <form className="col-11 col-md-10 col-lg-6 mx-auto jumbotron">
          <div className="form-row">
            <div className="col">
              <label htmlFor="validationDefault01"></label>
              <input
                type="text"
                className="form-control"
                id="validationDefault01"
                placeholder="Nombre"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="col">
              <label htmlFor="validationDefault02"></label>
              <input
                type="text"
                className="form-control"
                id="validationDefault02"
                placeholder="E-mail"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="col">
              <label htmlFor="validationDefault03"></label>
              <input
                type="text"
                className="form-control"
                id="validationDefault03"
                placeholder="Asunto"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="col">
              <label htmlFor="exampleFormControlTextarea1"></label>
              <textarea
                className="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder="Mensaje..."
              ></textarea>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-4 col-xl-6">
              <button
                className="btn btn-warning font-weight-bold"
                type="submit"
              >
                Enviar
              </button>
            </div>
            <div className="col-8 col-xl-6 " style={{ color: "#BFBFBF" }}>
              <h5 className="text-left font-weight-bold mt-2">
                <i className="fab fa-whatsapp mr-1"></i>+54 9 11-3682-8601
              </h5>
              <h5 className="text-left font-weight-bold mt-2">
                <i className="far fa-envelope mr-1"></i>rentalcaratua@gmail.com
              </h5>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default Contact;
