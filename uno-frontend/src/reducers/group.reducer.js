import { groupConstants } from '../constants';

export default function groups(state = {}, action) {
	switch (action.type) {
		//Crear grupo
		case groupConstants.GROUP_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case groupConstants.GROUP_CREATE_SUCCESS:
			return {
				register: true,
			};
		case groupConstants.GROUP_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case groupConstants.GROUP_TABLE_REQUEST:
			return {
				loading: true
			};
		case groupConstants.GROUP_TABLE_SUCCESS:
			return {
				data: action.groups,
				loading: false
			};
		case groupConstants.GROUP_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//Eliminar grupo
		case groupConstants.GROUP_DELETE_REQUEST:
			return {
				deleting: true
			};
		case groupConstants.GROUP_DELETE_SUCCESS:
			return {
				deleted: true,
			};
		case groupConstants.GROUP_DELETE_FAILURE:
			return {
				error: action.error
			};

		//obtener sedes select
		case groupConstants.GROUP_SELECT_REQUEST:
			return {
				getting: true
			};
		case groupConstants.GROUP_SELECT_SUCCESS:
			return {
				obtained:true,
				list: action.list,
			};
		case groupConstants.GROUP_SELECT_FAILURE:
			return {
				error: action.error
			};

		case groupConstants.CLEAR:
				return {};
	
		default:
		return state
	}
}