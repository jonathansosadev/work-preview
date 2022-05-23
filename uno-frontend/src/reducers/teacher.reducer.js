import { teacherConstants } from '../constants';

export default function teachers(state = {}, action) {
	switch (action.type) {
		//Crear profesor
		case teacherConstants.TEACHER_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case teacherConstants.TEACHER_CREATE_SUCCESS:
			return {
				register:true
			};
		case teacherConstants.TEACHER_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case teacherConstants.TEACHER_TABLE_REQUEST:
			return {
				loading: true
			};
		case teacherConstants.TEACHER_TABLE_SUCCESS:
			return {
				data: action.teachers,
				loading: false
			};
		case teacherConstants.TEACHER_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener profesor
		case teacherConstants.TEACHER_GET_REQUEST:
			return {
				searching: true
			};
		case teacherConstants.TEACHER_GET_SUCCESS:
			return {
				searched:true,
				teacher: action.teacher,
			};
		case teacherConstants.TEACHER_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de profesor
		case teacherConstants.TEACHER_UPDATE_REQUEST:
			return {
				updating: true
			};
		case teacherConstants.TEACHER_UPDATE_SUCCESS:
			return {
				success: true,
				teacherUpdated: action.teacher,
			};
		case teacherConstants.TEACHER_UPDATE_FAILURE:
			return {
				error: action.error
			};

		case teacherConstants.CLEAR:
				return {};
	
		default:
		return state
	}
}