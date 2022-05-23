import { userConstants } from '../constants';

export default function users(state = {}, action) {
	switch (action.type) {
		case userConstants.GETALL_REQUEST:
			return {
				loading: true
			};
		case userConstants.GETALL_SUCCESS:
			return {
				items: action.users
			};
		case userConstants.GETALL_FAILURE:
			return { 
				error: action.error
			};

		//Actualización de información
		case userConstants.UPDATE_DATA_REQUEST:
			return {
				updating: true
			};
		case userConstants.UPDATE_DATA_SUCCESS:
			return {
				success: true,
				userUpdated: action.user,
			};
		case userConstants.UPDATE_DATA_FAILURE:
			return {
				error: action.error
			};

		//DataTable
		case userConstants.USER_TABLE_REQUEST:
			return {
				loading: true
			};
		case userConstants.USER_TABLE_SUCCESS:
			return {
				data: action.users,
				loading: false
			};
		case userConstants.USER_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener usuario
		case userConstants.USER_GET_REQUEST:
			return {
				searching: true
			};
		case userConstants.USER_GET_SUCCESS:
			return {
				searched:true,
				user: action.user,
			};
		case userConstants.USER_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de usuario desde admin
		case userConstants.USER_UPDATE_REQUEST:
			return {
				updating: true
			};
		case userConstants.USER_UPDATE_SUCCESS:
			return {
				success: true,
				userUpdated: action.user,
			};
		case userConstants.USER_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//Obtener lista de usuarios y sucursales
		case userConstants.USER_LIST_REQUEST:
			return {
				getting: true
			};
		case userConstants.USER_LIST_SUCCESS:
			return {
				obtained: true,
				list: action.users,
			};
		case userConstants.USER_LIST_FAILURE:
			return {
				error: action.error
			};
			
		default:
		return state
	}
}