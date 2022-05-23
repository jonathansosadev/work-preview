// Contains the forms steps passed as children
// Does nothing but to hold those and show the form step

import React from "react";
import { useHistory } from "react-router-dom";

const CarRegisterFormLayout = (props) => {
  const history = useHistory();

  const {
    formControls: { step, nextStep, prevStep, successScreen, canProceed },
    handlers: { handleSubmit },
  } = props;

  const lastFormStep = props.children.length - 2;
  const lastScreen = props.children.length - 1;

  // Programatic form crumbs, for the greater good
  const formCrumbs = () => {
    const stepCrumbsColourer = (crumbNumber) => {
      let classes = "";

      if (crumbNumber === step && crumbNumber !== lastScreen)
        classes += "_crumbs_gradient_filler ";

      if (
        crumbNumber < step ||
        (crumbNumber === step && crumbNumber === lastScreen)
      )
        classes += "_crumbs_filler ";

      if (crumbNumber === 0) classes += "_crumbs_border_top_left";

      if (crumbNumber === lastScreen) classes += "_crumbs_border_top_right";

      return classes;
    };

    return props.children.map((step, index) => (
      <div
        key={index}
        className={`col text-white text-center ${stepCrumbsColourer(index)}`}
      >
        <span className="p-1"></span>
      </div>
    ));
  };

  return (
    <>
      <section className="row justify-content-center py-3 _bg_topographic">
        <div className="col">
          <div className="row justify-content-center my-2 my-md-4">
            <div className="col-12 text-center">
              <h2>Suma tu coche a ATUA</h2>
            </div>
          </div>

          <div className="row justify-content-center my-2 my-md-3">
            <form
              onSubmit={(evt) => handleSubmit(evt, successScreen)}
              className="col-11 col-md-6 card my-3 _register_form_container _register_form_border _element_shadow"
            >
              {/* Programmatic Step Crumbs */}
              <div className="row justify-content-center">{formCrumbs()}</div>

              {/* Form Step */}

              {props.children[step]}

              {/* Controls */}

              <div className="row justify-content-around my-5">
                <div className="col-12 col-md-6">
                  <div className="row justify-content-center">
                    {step <= lastFormStep && step > 0 && (
                      <div className="col-5 text-center">
                        <button
                          type="button"
                          onClick={() => prevStep(lastFormStep)}
                          className="btn _bg_secondary text-white"
                        >
                          Anterior
                        </button>
                      </div>
                    )}

                    {step < lastFormStep && (
                      <div className="col-5 text-center">
                        <button
                          type="button"
                          onClick={(evt) => {
                            nextStep(lastFormStep);
                          }}
                          className="btn _bg_primary text-white"
                          disabled={!canProceed(step)}
                        >
                          Siguiente
                        </button>
                      </div>
                    )}

                    {step === lastFormStep && (
                      <div className="col-5 text-center">
                        <button
                          type="submit"
                          className="btn _bg_primary_shade1 text-white"
                          disabled={!canProceed(step)}
                        >
                          Registrar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="row justify-content-center">
            <div className="col-auto">
              <button
                onClick={() => history.goBack()}
                className="btn _back_button"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CarRegisterFormLayout;
