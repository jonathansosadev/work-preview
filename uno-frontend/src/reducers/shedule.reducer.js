import { sheduleConstants } from '../constants';

export default function shedules(state = {}, action) {
	switch (action.type) {
		//Crear
		case sheduleConstants.SHEDULE_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case sheduleConstants.SHEDULE_CREATE_SUCCESS:
			return {
				success: true,
			};
		case sheduleConstants.SHEDULE_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case sheduleConstants.SHEDULE_TABLE_REQUEST:
			return {
				loading: true
			};
		case sheduleConstants.SHEDULE_TABLE_SUCCESS:
			return {
				data: action.shedules,
				loading: false
			};
		case sheduleConstants.SHEDULE_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener calendario
		case sheduleConstants.SHEDULE_GET_REQUEST:
			return {
				searching: true
			};
		case sheduleConstants.SHEDULE_GET_SUCCESS:
			return {
				shedule: action.shedule,
			};
		case sheduleConstants.SHEDULE_GET_FAILURE:
			return {
				error: action.error
			};

		//obtener calendario usuario
		case sheduleConstants.SHEDULE_USER_GET_REQUEST:
			return {
				searching: true
			};
		case sheduleConstants.SHEDULE_USER_GET_SUCCESS:
			return {
				shedule: action.shedule,
				searching: false,
			};
		case sheduleConstants.SHEDULE_USER_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de calendario
		case sheduleConstants.SHEDULE_UPDATE_REQUEST:
			return {
				updating: true
			};
		case sheduleConstants.SHEDULE_UPDATE_SUCCESS:
			return {
				updating: false,
				success: true,
			};
		case sheduleConstants.SHEDULE_UPDATE_FAILURE:
			return {
				updating: false,
				success: false,
				error: action.error
			};

		//Eliminar grupo
		case sheduleConstants.SHEDULE_DELETE_REQUEST:
			return {
				deleting: true,
				deleted: false,
			};
		case sheduleConstants.SHEDULE_DELETE_SUCCESS:
			return {
				deleted: true,
			};
		case sheduleConstants.SHEDULE_DELETE_FAILURE:
			return {
				error: action.error
			};

		//obtener horarios select
		case sheduleConstants.SHEDULE_SELECT_REQUEST:
			return {
				getting: true
			};
		case sheduleConstants.SHEDULE_SELECT_SUCCESS:
			return {
				obtained:true,
				list: action.list,
			};
		case sheduleConstants.SHEDULE_SELECT_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}