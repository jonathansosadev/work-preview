import { classesConstants } from '../constants/classes.constants';

export default function classes(state = {}, action) {
	switch (action.type) {
		//Crear clase
		case classesConstants.CLASSES_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case classesConstants.CLASSES_CREATE_SUCCESS:
			return {
				register: true,
			};
		case classesConstants.CLASSES_CREATE_FAILURE:
			return {};

		//Eliminar clase
		case classesConstants.CLASSES_DELETE_REQUEST:
			return {
				deleting: true
			};
		case classesConstants.CLASSES_DELETE_SUCCESS:
			return {
				deleted: true,
			};
		case classesConstants.CLASSES_DELETE_FAILURE:
			return {
				error: action.error
			};

		//DataTable
		case classesConstants.CLASSES_TABLE_REQUEST:
			return {
				loading: true
			};
		case classesConstants.CLASSES_TABLE_SUCCESS:
			return {
				data: action.classes,
				loading: false
			};
		case classesConstants.CLASSES_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener materia
		case classesConstants.CLASSES_GET_REQUEST:
			return {
				searching: true
			};
		case classesConstants.CLASSES_GET_SUCCESS:
			return {
				searched:true,
				matter: action.clase,
			};
		case classesConstants.CLASSES_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de materia
		case classesConstants.CLASSES_UPDATE_REQUEST:
			return {
				updating: true
			};
		case classesConstants.CLASSES_UPDATE_SUCCESS:
			return {
				success: true,
				userMatter: action.matters,
			};
		case classesConstants.CLASSES_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//DataTable
		case classesConstants.CLASSES_MATTER_REQUEST:
			return {
				getting: true
			};
		case classesConstants.CLASSES_MATTER_SUCCESS:
			return {
				groupMatter: action.matters,
				getting: false
			};
		case classesConstants.CLASSES_MATTER_FAILURE:
			return { 
				error: action.error,
			};

		case classesConstants.CLEAR:
				return {};
	
		default:
		return state
	}
}