import React, { useState } from "react";

import FAQLayout from "../faq/FAQLayout";
import FAQModal from "../faq/sub/FAQModal";

import ownerImage from "../../assets/images/v1/faq_owner.png";
import customerImage from "../../assets/images/v1/faq_customer.png";

import data from "../../assets/faq_questions/faqQuestions.json";

const FAQ = () => {
  const images = { owner: ownerImage, customer: customerImage };

  const [showQuestions, setShowQuestions] = useState(false);

  const [faqs, setFaqs] = useState("owner");

  const openQuestions = (section = "owner") => {
    document.getElementsByTagName("body")[0].classList.add("_no_scroll");

    if (section) {
      setFaqs(section);
    }

    setShowQuestions(true);
  };

  const closeQuestions = () => {
    document.getElementsByTagName("body")[0].classList.remove("_no_scroll");

    setShowQuestions(false);
  };

  return (
    <>
      <FAQLayout openQuestions={openQuestions} images={images} />
      {showQuestions ? (
        <FAQModal
          openQuestions={openQuestions}
          closeQuestions={closeQuestions}
          data={data[faqs]}
          image={images[faqs]}
        />
      ) : null}
    </>
  );
};

export default FAQ;
