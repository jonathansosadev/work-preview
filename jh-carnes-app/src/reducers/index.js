import {combineReducers} from 'redux';
import user from './user';
import loading from './loading';
import categories from './categories';
import foods from './foods';
import reservations from './reservations';
import schedules from './shedules';
import clients from './clients';
import shifts from './shifts';
import events from './events';
import rangePoints from './rangePoints';
import eventsAdmin from './eventadmin';
import auditPoints from './auditPoints';
import {order} from './order';
import {dishes} from './dishes';

const reducers = combineReducers({
  auditPoints,
  user,
  loading,
  categories,
  foods,
  reservations,
  schedules,
  clients,
  shifts,
  events,
  rangePoints,
  eventsAdmin,
  order,
  dishes,
});

export default reducers;
