import Vue from 'vue';
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css';

// asociate it to the library, if you need to add more you can separate them by a comma
Vue.use(DatePicker);

export default ({ store }) => {
  switch (store.state.locale) {
    case 'fr':
      require('vue2-datepicker/locale/fr');
      break;
    case 'es':
      require('vue2-datepicker/locale/es');
      break;
    case 'ca':
      require('vue2-datepicker/locale/ca');
      break;
  }
}

