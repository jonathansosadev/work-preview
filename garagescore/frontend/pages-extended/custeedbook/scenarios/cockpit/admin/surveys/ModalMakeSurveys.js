import ModalMakeSurveys from "~/components/cockpit/admin/surveys/ModalMakeSurveys";


export default {
  component: ModalMakeSurveys,
  props: [
    {
      label: "closeModal",
      value: () => {},
      type: "text"
    },
    {
      label: "surveySignaturesModifications",
      value: [],
      type: "array"
    },
    {
      label: "saveModifications",
      value: () => {},
      type: "text"
    },
    {
      label: "updateGarageSurveySignature",
      value: () => {},
      type: "text"
    },
  ]
}
