import Vue from 'vue';
import Toast, { TYPE, POSITION } from 'vue-toastification';
import "vue-toastification/dist/index.css";

Vue.use(Toast, {
  position: POSITION.BOTTOM_CENTER,
  toastDefaults: {
    [TYPE.ERROR]: {
      timeout: false,
    },
    [TYPE.SUCCESS]: {
      timeout: 3000,
    },
    [TYPE.WARNING]: {
      timeout: false,
    },
    [TYPE.INFO]: {
      timeout: false,
    },
  },
});
