import React from "react";
import FAQQuestion from "./FAQQuestion";

const FAQModal = (props) => {
  const {
    data: { title, questions },
    image,
    closeQuestions,
  } = props;

  return (
    <div
      className="row justify-content-center _modal_container"
      onClick={closeQuestions}
    >
      <section className="col-10 col-md-8 m-1 m-md-5 p-3 pt-md-1 pb-md-4 px-md-4 rounded _bg_white">
        <div className="row justify-content-end align-items-center m-0 p-0">
          <span
            className="h2 text-center _hover_cursor"
            onClick={closeQuestions}
          >
            &#215;
          </span>
        </div>

        <article className="row justify-content-center mb-3 mb-md-5">
          <div className="col-auto">
            <figure className="figure text-center">
              <img
                src={image}
                alt="placeholding"
                className="figure-img mx-auto"
                width="50%"
              />
            </figure>
            <h2 className="h4 text-center _text_primary_shade1">{title}</h2>
          </div>
        </article>

        {questions.map((question) => (
          <FAQQuestion
            key={question.id}
            question={question.question}
            answer={question.answer}
          />
        ))}
      </section>
    </div>
  );
};

export default FAQModal;
