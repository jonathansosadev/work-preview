import { combineReducers } from 'redux';

import authentication from './authentication.reducer';
import registration from './registration.reducer';
import users from './users.reducer';
import alert from './alert.reducer';
import agencies from './agencies.reducer';
import products from './product.reducer';
import inventories from './inventory.reducer';
import sales from './sales.reducer';
import coin from './coin.reducer';
import terminal from './terminal.reducer';
import departure from './departure.reducer';
import ticket from './ticket.reducer';
import data from './data.reducer';
import offline from './offline.reducer';
import pending from './pending.reducer';
import download from './download.reducer';
import cron from './cron.reducer';
import offer from './offer.reducer';
import box from './box.reducer';
const rootReducer = combineReducers({
    authentication,
    registration,
    users,
    agencies,
    products,
    inventories,
    sales,
    coin,
    terminal,
    departure,
    ticket,
    alert,
    data,
    offline,
    pending,
    download,
    cron,
    offer,
    box
});

export default rootReducer;