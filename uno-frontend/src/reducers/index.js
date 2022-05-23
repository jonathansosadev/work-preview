import { combineReducers } from 'redux';

import authentication from './authentication.reducer';
import registration from './registration.reducer';
import users from './users.reducer';
import admin from './admin.reducer';
import alert from './alert.reducer';
import agencies from './agencies.reducer';
import careers from './career.reducer';
import matters from './matteer.reducer';
import classes from './classes.reducer';
import teachers from './teacher.reducer';
import students from './student.reducer';
import logsEmail from './log.email.reducer';
import inscription from './inscription.reducer';
import files from './file.reducer';
import documents from './doc.reducer';
import score from './score.reducer';
import offer from './offer.reducer';
import reference from './reference.reducer';
import notification from './notification.reducer';
import group from './group.reducer';
import shedules from './shedule.reducer';

const rootReducer = combineReducers({
	authentication,
	registration,
	admin,
	users,
	alert,
	agencies,
	careers,
	matters,
	classes,
	teachers,
	students,
	inscription,
	logsEmail,
	files,
	documents,
	score,
	offer,
	reference,
	notification,
	group,
	shedules
});

export default rootReducer;