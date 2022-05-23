import { adminConstants } from '../constants';

export default function admin(state = {}, action) {
	switch (action.type) {
		//Crear administrador
		case adminConstants.ADMIN_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case adminConstants.ADMIN_CREATE_SUCCESS:
			return {
				register:true
			};
		case adminConstants.ADMIN_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case adminConstants.ADMIN_TABLE_REQUEST:
			return {
				loading: true
			};
		case adminConstants.ADMIN_TABLE_SUCCESS:
			return {
				data: action.admins,
				loading: false
			};
		case adminConstants.ADMIN_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener administrador
		case adminConstants.ADMIN_GET_REQUEST:
			return {
				searching: true
			};
		case adminConstants.ADMIN_GET_SUCCESS:
			return {
				searched:true,
				admin: action.admin,
			};
		case adminConstants.ADMIN_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de administrador
		case adminConstants.ADMIN_UPDATE_REQUEST:
			return {
				updating: true
			};
		case adminConstants.ADMIN_UPDATE_SUCCESS:
			return {
				success: true,
				adminUpdated: action.admin,
			};
		case adminConstants.ADMIN_UPDATE_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}