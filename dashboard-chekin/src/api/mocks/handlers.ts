import {rest} from 'msw';
import api, {getURL} from '../index';
import {PAYMENT_PROVIDERS} from '../../utils/constants';

const PAYMENTS_SETTINGS_ID = '1';

const handlers = [
  rest.get(getURL(api.paymentsSettings.ENDPOINTS.all()), (req, res, ctx) => {
    return res(ctx.json({provider: PAYMENT_PROVIDERS.stripe, id: PAYMENTS_SETTINGS_ID}));
  }),
  rest.post(
    getURL(api.paymentsSettings.ENDPOINTS.all(PAYMENTS_SETTINGS_ID)),
    (req, res, ctx) => {
      return res();
    },
  ),
  rest.patch(
    getURL(api.paymentsSettings.ENDPOINTS.all(PAYMENTS_SETTINGS_ID)),
    (req, res, ctx) => {
      return res(
        ctx.json({provider: PAYMENT_PROVIDERS.stripe, id: PAYMENTS_SETTINGS_ID}),
      );
    },
  ),
  rest.post(getURL(api.paymentsSettings.ENDPOINTS.refresh()), (req, res, ctx) => {
    return res();
  }),
  rest.post(getURL(api.auth.ENDPOINTS.auth()), (req, res, ctx) => {
    return res(ctx.json({token: 'test'}));
  }),
  rest.post(getURL(api.auth.ENDPOINTS.refresh()), (req, res, ctx) => {
    return res(ctx.json({token: 'test'}));
  }),
  rest.get(getURL(api.users.ENDPOINTS.me()), (req, res, ctx) => {
    return res(ctx.json({name: 'test', email: 'test', are_any_payments_activated: true}));
  }),
  rest.patch(getURL(api.users.ENDPOINTS.me()), (req, res, ctx) => {
    return res(ctx.json({name: 'test', email: 'test'}));
  }),
  rest.get(getURL(api.paymentsSettings.ENDPOINTS.movementsPreview()), (req, res, ctx) => {
    return res(ctx.json({'2021-05-02': [], '2021-05-03': [], '2021-05-04': []}));
  }),
  rest.patch(
    getURL(api.paymentsSettings.ENDPOINTS.all(PAYMENTS_SETTINGS_ID)),
    (req, res, ctx) => {
      return res();
    },
  ),
];

export {handlers, PAYMENTS_SETTINGS_ID};
