import {setupServer} from 'msw/node';
import {handlers} from './handlers';

const server = setupServer(...handlers);
server.listen({onUnhandledRequest: 'warn'});

export {server};
