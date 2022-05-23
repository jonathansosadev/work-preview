import React from "react";

const AccountActivationModalLayout = () => {
  return (
    <div className="row justify-content-center _modal_container">
      <section className="col-9 col-md-4 my-auto">
        <div className="row justify-content-center _modal_header">
          <div className="col-3 p-2 p-md-4 text-center _bg_primary _border_top_left">
            ???????????
          </div>
          <div className="col-9 p-1 p-md-4 _bg_primary _border_top_right">
            <h4 className="text-right text-white font-weight-bold">
              ??????????????
            </h4>
          </div>
        </div>

        <div className="row justify-content-start p-2 _bg_tertiary _modal_body">
          <div className="col-auto p-1 p-md-2">
            <p>???????????</p>
          </div>
        </div>

        <div className="row justify-content-end rounded-bottom p-2 _bg_tertiary ">
          <div className="col-auto p-1 p-md-2">
            <button
              type="button"
              className="btn _back_button"
              // onClick={closeModal}
            >
              ???????????????
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountActivationModalLayout;
