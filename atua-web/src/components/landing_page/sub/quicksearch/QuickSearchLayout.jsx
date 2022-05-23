import React from "react";
import { useTranslation } from "react-i18next";

const QuickSearchLayout = (props) => {
  const [t] = useTranslation("landing");

  const { handleInput, handleSubmit, quickSearch } = props;

  return (
    <div className="col-12 col-md-4 py-2 my-2 px-0 mx-0 px-md-2 mx-md-2">
      <form className="row p-0 m-0 px-md-3" onSubmit={handleSubmit}>
        <div className="col-12 _quicksearch_form">
          <div className="form-row">
            <input
              type="date"
              id="available_since"
              name="available_since"
              onChange={handleInput}
              className="form-control text-center _quicksearch_start"
              defaultValue={quickSearch.available_since}
            />
          </div>

          <div className="form-row">
            <input
              type="date"
              id="available_until"
              name="available_until"
              onChange={handleInput}
              className="form-control text-center _quicksearch_end"
              // defaultValue={quickSearch.available_until}
            />
          </div>
          <div className="form-row">
            <button type="submit" className="btn _quicksearch_button">
              {t("quicksearch.button")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuickSearchLayout;
