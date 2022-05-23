import testSurveyForm from "~/components/grey-bo/testSurveyForm.vue"

export default {
    component: testSurveyForm,
    props: [
        {
            label: "loading",
            value: false,
            inputType: "checkbox" 
        },
        {
            label: "sendByEmail",
            value: true,
            inputType: "checkbox" 
        },
        {
            label: "sendByPhone",
            value: false,
            inputType: "checkbox" 
        },
        {
            label: "success",
            value: false,
            inputType: "checkbox"
        },
        {
            label: "submitFn",
            value: () => alert('Request sent successfully'),
            inputType: 'function'
        },
        {
            label: "resetFn",
            value: () => {},
            inputType: 'function'
        },
        {
            label: "cancelFn",
            value: () => alert('Form submit cancelled'),
            inputType: 'function'
        }

    ]
}