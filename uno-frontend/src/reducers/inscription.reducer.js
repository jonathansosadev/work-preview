import { inscriptionConstants } from '../constants';

export default function inscription(state = {}, action) {
	switch (action.type) {
		//Crear inscripcion
		case inscriptionConstants.INSCRIPTION_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case inscriptionConstants.INSCRIPTION_CREATE_SUCCESS:
			return {
				register:true
			};
		case inscriptionConstants.INSCRIPTION_CREATE_FAILURE:
			return {
				error: action.error,
			};
	  
		//DataTable
		case inscriptionConstants.INSCRIPTION_TABLE_REQUEST:
			return {
				loading: true
			};
		case inscriptionConstants.INSCRIPTION_TABLE_SUCCESS:
			return {
				data: action.inscriptions,
				loading: false
			};
		case inscriptionConstants.INSCRIPTION_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener inscripcion
		case inscriptionConstants.INSCRIPTION_GET_REQUEST:
			return {
				searching: true
			};
		case inscriptionConstants.INSCRIPTION_GET_SUCCESS:
			return {
				searched:true,
				inscription: action.inscription,
			};
		case inscriptionConstants.INSCRIPTION_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de inscripcion
		case inscriptionConstants.INSCRIPTION_UPDATE_REQUEST:
			return {
				updating: true
			};
		case inscriptionConstants.INSCRIPTION_UPDATE_SUCCESS:
			return {
				success: true,
				inscriptionUpdated: action.inscription,
			};
		case inscriptionConstants.INSCRIPTION_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//obtener data de inscripcion, carreras, materias
		case inscriptionConstants.INSCRIPTION_DATA_REQUEST:
			return {
				getting: true
			};
		case inscriptionConstants.INSCRIPTION_DATA_SUCCESS:
			return {
				obtained:true,
				dataInscription: action.data,
			};
		case inscriptionConstants.INSCRIPTION_DATA_FAILURE:
			return {
				error: action.error
			};

		//Eliminacion de inscripcion
		case inscriptionConstants.INSCRIPTION_DELETE_REQUEST:
			return {
				deleting: true
			};
		case inscriptionConstants.INSCRIPTION_DELETE_SUCCESS:
			return {
                successDeleted: true
			};
		case inscriptionConstants.INSCRIPTION_DELETE_FAILURE:
			return {
				error: action.error
			};
		
		case inscriptionConstants.CLEAR:
				return {};
	
		default:
		return state
	}
}