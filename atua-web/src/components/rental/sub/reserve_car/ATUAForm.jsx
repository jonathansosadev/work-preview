import React, { useState } from "react";

const ATUAForm = (props) => {
  const { handleInput, handleSubmit, handleReset } = props.handlers;

  const { actions, availability } = props;

  const [reservationsList, setReservationsList] = useState([]);

  const reservationList = async () => {
    const data = await actions.getUserReservations();

    await setReservationsList(data);
  };

  const deleteReservation = async () => {
    const id = document.getElementById("reservationSelector").value;

    if (id !== "") actions.deleteReservation(id);
  };

  return (
    <div className="row justify-content-around">
      <div className="col-6 text-center">
        <h3>Atua Form</h3>
        <div className="row justify-content-center">
          <form
            className="col-12"
            id="atuaForm"
            onSubmit={handleSubmit}
            onReset={handleReset}
          >
            <div className="row justify-content-center">
              <input
                id="start_date"
                type="date"
                data-form="atuaForm"
                onChange={handleInput}
                className="col-12"
              />
              <input
                id="end_date"
                type="date"
                data-form="atuaForm"
                onChange={handleInput}
                className="col-12"
              />
              <input
                id="paid_amount"
                type="number"
                data-form="atuaForm"
                onChange={handleInput}
                placeholder="paid amount"
                className="col-12"
              />
            </div>
            <div>
              <button type="submit">Reservar</button>
            </div>
            <div>
              <button type="reset">Reset</button>
            </div>
          </form>
        </div>
      </div>
      <div id="atuaFormTestContainer" className="col-6">
        <div className="row">
          <div className="col-12">
            <button onClick={actions.checkPublicationAvailability}>
              Check availability
            </button>
            <p>
              Available:
              {availability ? (availability.available ? "YES" : "NO") : ""}
            </p>
            <p>Reason: {availability ? availability.reason : ""}</p>
            <p>
              Advanced:
              {availability ? availability.advanced_payment : ""}
            </p>
            <p>Total: {availability ? availability.total : ""}</p>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button onClick={reservationList}>reservations list</button>
          </div>
          <div className="col">
            <select id="reservationSelector">
              <option value="">Empty</option>
              {reservationsList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}
                </option>
              ))}
            </select>
            <button onClick={deleteReservation}>Delete selected</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATUAForm;
