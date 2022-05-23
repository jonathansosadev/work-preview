/* Header */
import Header from "~/components/automation/Header";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: Header,
  props: [
        {
          label: 'logoUrls',
          value: ['https://i.imgur.com/rLfc50N.jpg', 'https://i.imgur.com/rLfc50N.jpg'],
          inputType: 'json',
        },
        {
          label: 'garageName',
          value: `Garage auto de l'Ouest (Fiat Alfa Romeo Jeep Abarth Brest)`,
          inputType: 'text'
        },
      ]
};