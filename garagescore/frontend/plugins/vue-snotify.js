import Vue from 'vue';
import Snotify from 'vue-snotify';

Vue.use(Snotify, {
  timeout: 8000,
  showProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true
});
