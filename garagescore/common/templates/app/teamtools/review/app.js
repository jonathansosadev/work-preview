'use strict';

const app = new ReviewApp(Vue, document.location.hash ? document.location.hash.substr(1) : ''); // eslint-disable-line no-undef

app.start();
