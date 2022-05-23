import React from 'react';
import { Provider } from 'react-redux';
import { store } from './helpers';
import '../src/assets/css/bootstrap.min.css';
import '../src/assets/css/now-ui-kit.css';
import '../src/assets/demo/demo.css';
import '../src/assets/demo/nucleo-icons-page-styles.css';
import '../src/assets/css/menu.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { render } from 'react-dom';

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();