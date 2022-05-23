import React from "react";

const MercadoPagoForm = () => {
  return (
    <div className="row justify-content-around">
      <div className="col-6 text-center">
        <h3>Mercado Pago</h3>
        <div className="row justify-content-center">
          <form id="form-checkout" className="col-12">
            <div className="row justify-content-center">
              <input
                type="text"
                name="cardNumber"
                id="form-checkout__cardNumber"
                placeholder="form-checkout__cardNumber"
                className="col-12"
              />
              <input
                type="text"
                name="cardExpirationMonth"
                id="form-checkout__cardExpirationMonth"
                placeholder="form-checkout__cardExpirationMonth"
                className="col-12"
              />
              <input
                type="text"
                name="cardExpirationYear"
                id="form-checkout__cardExpirationYear"
                placeholder="form-checkout__cardExpirationYear"
                className="col-12"
              />
              <input
                type="text"
                name="cardholderName"
                id="form-checkout__cardholderName"
                placeholder="form-checkout__cardholderName"
                className="col-12"
              />
              <input
                type="email"
                name="cardholderEmail"
                id="form-checkout__cardholderEmail"
                placeholder="form-checkout__cardholderEmail"
                className="col-12"
              />
              <input
                type="text"
                name="securityCode"
                id="form-checkout__securityCode"
                placeholder="form-checkout__securityCode"
                className="col-12"
              />
              <select
                name="issuer"
                id="form-checkout__issuer"
                placeholder="form-checkout__issuer"
                className="col-12"
              >
                <option>issuer</option>
              </select>
              <select
                name="identificationType"
                id="form-checkout__identificationType"
                placeholder="form-checkout__identificationType"
                className="col-12"
              >
                <option>id type</option>
              </select>
              <input
                type="text"
                name="identificationNumber"
                id="form-checkout__identificationNumber"
                placeholder="form-checkout__identificationNumber"
                className="col-12"
              />
              <select
                name="installments"
                id="form-checkout__installments"
                className="col-12"
              >
                <option>installments</option>
              </select>
            </div>

            <div className="row justify-content-around">
              <button type="submit" id="form-checkout__submit">
                Pay
              </button>
              <progress value="0" className="progress-bar">
                Loading...
              </progress>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoForm;
