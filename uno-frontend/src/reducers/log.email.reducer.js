import { logEmailsConstants } from '../constants';

export default function logsEmail(state = {}, action) {
	switch (action.type) {

		//DataTable
		case logEmailsConstants.LOG_EMAIL_TABLE_REQUEST:
			return {
				loading: true
			};
		case logEmailsConstants.LOG_EMAIL_TABLE_SUCCESS:
			return {
				data: action.logsEmail,
				loading: false
			};
		case logEmailsConstants.LOG_EMAIL_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};
	
		default:
		return state
	}
}