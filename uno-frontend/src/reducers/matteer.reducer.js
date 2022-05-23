import { matterConstants } from '../constants';

export default function matters(state = {}, action) {
	switch (action.type) {
		//Crear agencia
		case matterConstants.MATTER_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case matterConstants.MATTER_CREATE_SUCCESS:
			return {
				success: true
			};
		case matterConstants.MATTER_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case matterConstants.MATTER_TABLE_REQUEST:
			return {
				loading: true
			};
		case matterConstants.MATTER_TABLE_SUCCESS:
			return {
				data: action.matters,
				loading: false
			};
		case matterConstants.MATTER_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener materia
		case matterConstants.MATTER_GET_REQUEST:
			return {
				searching: true
			};
		case matterConstants.MATTER_GET_SUCCESS:
			return {
				searched:true,
				matter: action.matter,
			};
		case matterConstants.MATTER_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de materia
		case matterConstants.MATTER_UPDATE_REQUEST:
			return {
				updating: true
			};
		case matterConstants.MATTER_UPDATE_SUCCESS:
			return {
				success: true,
				matterUpdated: action.matter,
			};
		case matterConstants.MATTER_UPDATE_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}