import React from "react";

const FAQQuestion = (props) => {
  return (
    <article className="row justify-content-center mx-1 mx-md-5 mb-3 mb-md-5">
      <div className="col-auto">
        <h6 className="text-center">{props.question}</h6>
        <p className="text-center">{props.answer}</p>
      </div>
    </article>
  );
};

export default FAQQuestion;
