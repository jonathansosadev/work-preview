import React from "react";

const FAQLayout = (props) => {
  const { openQuestions, images } = props;

  return (
    <>
      <div className="row justify-content-center _faq_header">
        <div className="col-auto mt-5 mb-auto">
          <h2 className="_text_tertiary">
            <span className="font-weight-bold">FAQ</span> Preguntas Frecuentes
          </h2>
        </div>
      </div>

      <div className="row justify-content-center mt-n5 mb-5">
        <div className="col-10 col-md-9 card-deck">
          <div className="row justify-content-around">
            <div className="col-12 col-md-4">
              <div
                onClick={() => openQuestions("owner")}
                className="card m-1 p-0 _faq_card_border _element_shadow _hover_cursor"
              >
                <img
                  src={images.owner}
                  alt="FAQ Owner"
                  className="card-img-top _faq_card_img_border"
                />
                <div className="card-body">
                  <div>
                    <h4 className="card-title text-center font-weight-bold _text_primary_shade1">
                      Quiero alquilar mi auto
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                onClick={() => openQuestions("customer")}
                className="card m-1 p-0 _faq_card_border _element_shadow _hover_cursor"
              >
                <img
                  src={images.customer}
                  alt="FAQ Customer"
                  className="card-img-top _faq_card_img_border"
                />
                <div className="card-body">
                  <div>
                    <h4 className="card-title text-center font-weight-bold _text_primary_shade1">
                      Necesito un auto
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 _just_a_separator"></div>
    </>
  );
};

export default FAQLayout;
