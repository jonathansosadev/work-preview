import { referenceConstants } from '../constants';

export default function reference(state = {}, action) {
	switch (action.type) {
	  
		//DataTable Referencias
		case referenceConstants.REFERENCE_TABLE_REQUEST:
			return {
				loading: true
			};
		case referenceConstants.REFERENCE_TABLE_SUCCESS:
			return {
				data: action.data,
				loading: false
			};
		case referenceConstants.REFERENCE_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener nota
		case referenceConstants.REFERENCE_GET_REQUEST:
			return {
				searching: true
			};
		case referenceConstants.REFERENCE_GET_SUCCESS:
			return {
				searched:true,
				reference: action.reference,
			};
		case referenceConstants.REFERENCE_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de referencia
		case referenceConstants.REFERENCE_UPDATE_REQUEST:
			return {
				updating: true
			};
		case referenceConstants.REFERENCE_UPDATE_SUCCESS:
			return {
				success: true,
			};
		case referenceConstants.REFERENCE_UPDATE_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}