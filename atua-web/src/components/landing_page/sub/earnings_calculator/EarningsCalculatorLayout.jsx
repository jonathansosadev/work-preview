import React from "react";
import { useTranslation } from "react-i18next";

import calculate from "../../../../assets/images/v1/calculator.png";

const EarningsCalculatorLayout = (props) => {
  const {
    handlers: {
      handleBrandChange,
      handleModelChange,
      handleYearChange,
      calculateEarnings,
    },
    selectOptions: { brandsOptions, modelsOptions, yearOptions },
    // result,
  } = props;

  const [t] = useTranslation("landing");

  return (
    <section
      id="earningsCalculator"
      className="row justify-content-center align-items-center mt-3 _calculator_container"
    >
      <div className="col-12">
        <div className="row px-0 p-md-5">
          <article className="col-12 text-center p-5">
            <h2 className="m-0 font-weight-bold">
              {t("calculator_section.title")}
            </h2>
            <div className="row justify-content-center">
              <figure className="col-12 col-md-6 m-2">
                <img src={calculate} alt="Calculate" width="80%" />
              </figure>
              <div className="col-12">
                {/* {result && (
                  <div className="row justify-content-center p-3 m-2">
                    <div className="col-auto">
                      <p className="h4 text center text-muted">
                        {t("calculator_section.result.p1")}
                        <span className="_text_primary_shade1">
                          {` ${result}$ `}
                        </span>
                        {t("calculator_section.result.p2")}
                      </p>
                    </div>
                  </div>
                )} */}

                <form
                  onSubmit={calculateEarnings}
                  className="row justify-content-center align-items-center p-0 p-md-3 m-md-2 _calculator_form"
                >
                  <div className="col-12 col-md-3 p-0">
                    <select
                      className="form-control p-0 m-0 _calculator_input"
                      id="brand"
                      name="brand"
                      onChange={handleBrandChange}
                      defaultValue="null"
                      required
                    >
                      {brandsOptions()}
                    </select>
                  </div>
                  <div className="col-12 col-md-3 p-0">
                    <select
                      className="form-control p-0 m-0 _calculator_input"
                      id="model"
                      name="model"
                      onChange={handleModelChange}
                      defaultValue="null"
                      required
                    >
                      {modelsOptions()}
                    </select>
                  </div>
                  <div className="col-12 col-md-3 p-0">
                    <select
                      className="form-control p-0 m-0 _calculator_input"
                      id="price"
                      name="price"
                      onChange={handleYearChange}
                      defaultValue="null"
                      required
                    >
                      {yearOptions().length === 0 ? (
                        <option value="null">
                          {t("calculator_section.dropdowns.year")}
                        </option>
                      ) : (
                        yearOptions()
                      )}
                    </select>
                  </div>
                  <div className="col-6 p-3 m-2">
                    <button
                      type="submit"
                      className="btn _quicksearch_button text-white text-center"
                    >
                      {t("calculator_section.button")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default EarningsCalculatorLayout;
