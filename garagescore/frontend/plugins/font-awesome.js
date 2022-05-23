import Vue from 'vue';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// usage with fab icons: <font-awesome-icon :icon="['fab', 'linkedin']"/> 

// asociate it to the library, if you need to add more you can separate them by a comma
library.add(fas, far, fab);
Vue.component(FontAwesomeIcon.name, FontAwesomeIcon);
Vue.component(FontAwesomeLayers.name, FontAwesomeLayers);
