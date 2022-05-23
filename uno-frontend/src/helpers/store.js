import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const middlewares = [];

if (process.env.NODE_ENV === 'development') {
	const { createLogger } = require(`redux-logger`);
	const logger = createLogger({ collapsed: (getState, action, logEntry) => !logEntry.error });

	middlewares.push(logger);
    middlewares.push(thunkMiddleware);
}

export const store = createStore(
    rootReducer,
    applyMiddleware(...middlewares)
);