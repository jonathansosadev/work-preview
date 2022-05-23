import Vue from 'vue'
import { configure, addDecorator } from '@storybook/vue'
import { withKnobs } from '@storybook/addon-knobs';
import '@storybook/addon-actions/register';
import '@storybook/addon-console';

// ------------
// Font-awesome
// ------------

import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// asociate it to the library, if you need to add more you can separate them by a comma
library.add(fas, far, fab);
Vue.component(FontAwesomeIcon.name, FontAwesomeIcon);
Vue.component(FontAwesomeLayers.name, FontAwesomeLayers);

// --------------------------
// Global component register
// --------------------------
import Tile from '../components/ui/Tile';
import AppText from '../components/ui/AppText';

Vue.component('Tile', Tile);
Vue.component('AppText', AppText);


const req = require.context('./stories', true, /.story.js/);

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
addDecorator(withKnobs);
