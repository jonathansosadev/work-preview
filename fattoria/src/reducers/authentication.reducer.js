import { userConstants } from '../constants';
//const CryptoJS = require("crypto-js");
import CryptoJS from "crypto-js"
import { passphrase } from '../config/config';
import { history } from '../helpers';
let user = localStorage.getItem('user');

if(user){
	
	try{
		var bytes  = CryptoJS.AES.decrypt(user, passphrase);
		var originalData = bytes.toString(CryptoJS.enc.Utf8);
		user = JSON.parse(originalData);
	}catch(err){
		history.push('/login');
	}
}

const initialState = user ? { loggedIn: true, user } : {};

export default function authentication(state = initialState, action) {

	switch (action.type) {
	case userConstants.LOGIN_REQUEST:
		return {
			loggingIn: true,
			user: action.user
		};
	case userConstants.LOGIN_SUCCESS:
		return {
			loggedIn: true,
			user: action.user
		};
	case userConstants.LOGIN_FAILURE:
		return {};
	case userConstants.LOGOUT:
		return {};
	default:
		return state
}
}