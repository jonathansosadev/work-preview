import { userConstants } from '../constants';

export default function registration(state = {}, action) {
	switch (action.type) {
		case userConstants.REGISTER_REQUEST:
			return { registering: true };
		case userConstants.REGISTER_SUCCESS:
			return {};
		case userConstants.REGISTER_FAILURE:
			return {};
		case userConstants.EMAIL_CONFIRM_REQUEST:
			return { confirming: true };
		case userConstants.EMAIL_CONFIRM_SUCCESS:
			return {};
		case userConstants.EMAIL_CONFIRM_FAILURE:
			return {};
		default:
			return state
	}
}