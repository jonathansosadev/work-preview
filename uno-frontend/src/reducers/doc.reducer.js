import { documentConstants } from '../constants';

export default function documents(state = {}, action) {
	switch (action.type) {
		//Crear agencia
		case documentConstants.DOC_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case documentConstants.DOC_CREATE_SUCCESS:
			return {
				register:true
			};
		case documentConstants.DOC_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case documentConstants.DOC_TABLE_REQUEST:
			return {
				loading: true
			};
		case documentConstants.DOC_TABLE_SUCCESS:
			return {
				data: action.documents,
				loading: false
			};
		case documentConstants.DOC_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener archivo
		case documentConstants.DOC_GET_REQUEST:
			return {
				searching: true
			};
		case documentConstants.DOC_GET_SUCCESS:
			return {
				file: action.file,
			};
		case documentConstants.DOC_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización
		case documentConstants.DOC_UPDATE_REQUEST:
			return {
				updating: true
			};
		case documentConstants.DOC_UPDATE_SUCCESS:
			return {
				success: true,
				fileUpdated: action.file,
			};
		case documentConstants.DOC_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//Descargar
		case documentConstants.DOC_DOWNLOAD_REQUEST:
			return {
				downloading: true
			};
		case documentConstants.DOC_DOWNLOAD_SUCCESS:
			return {
				downloaded:true,
			};
		case documentConstants.DOC_DOWNLOAD_FAILURE:
			return {
				error: action.error
			};

		//Descargar
		case documentConstants.DOC_DELETE_REQUEST:
			return {
				deleting: true
			};
		case documentConstants.DOC_DELETE_SUCCESS:
			return {
				deleted:true,
			};
		case documentConstants.DOC_DELETE_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}