import { fileConstants } from '../constants';

export default function files(state = {}, action) {
	switch (action.type) {
		//Crear agencia
		case fileConstants.FILE_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case fileConstants.FILE_CREATE_SUCCESS:
			return {
				register:true
			};
		case fileConstants.FILE_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case fileConstants.FILE_TABLE_REQUEST:
			return {
				loading: true
			};
		case fileConstants.FILE_TABLE_SUCCESS:
			return {
				data: action.files,
				loading: false
			};
		case fileConstants.FILE_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener archivo
		case fileConstants.FILE_GET_REQUEST:
			return {
				searching: true
			};
		case fileConstants.FILE_GET_SUCCESS:
			return {
				file: action.file,
			};
		case fileConstants.FILE_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización
		case fileConstants.FILE_UPDATE_REQUEST:
			return {
				updating: true
			};
		case fileConstants.FILE_UPDATE_SUCCESS:
			return {
				success: true,
				fileUpdated: action.file,
			};
		case fileConstants.FILE_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//Descargar
		case fileConstants.FILE_DOWNLOAD_REQUEST:
			return {
				downloading: true
			};
		case fileConstants.FILE_DOWNLOAD_SUCCESS:
			return {
				downloaded:true,
			};
		case fileConstants.FILE_DOWNLOAD_FAILURE:
			return {
				error: action.error
			};

		//Eliminar
		case fileConstants.FILE_DELETE_REQUEST:
			return {
				deleting: true
			};
		case fileConstants.FILE_DELETE_SUCCESS:
			return {
				deleted:true,
			};
		case fileConstants.FILE_DELETE_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}