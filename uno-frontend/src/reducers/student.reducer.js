import { studentConstants } from '../constants';

export default function students(state = {}, action) {
	switch (action.type) {

		//DataTable
		case studentConstants.STUDENT_TABLE_REQUEST:
			return {
				loading: true
			};
		case studentConstants.STUDENT_TABLE_SUCCESS:
			return {
				data: action.students,
				loading: false
			};
		case studentConstants.STUDENT_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener estudiante
		case studentConstants.STUDENT_GET_REQUEST:
			return {
				searching: true
			};
		case studentConstants.STUDENT_GET_SUCCESS:
			return {
				searched:true,
				student: action.student,
			};
		case studentConstants.STUDENT_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de estudiante
		case studentConstants.STUDENT_UPDATE_REQUEST:
			return {
				updating: true
			};
		case studentConstants.STUDENT_UPDATE_SUCCESS:
			return {
				success: true,
				studentUpdated: action.student,
			};
		case studentConstants.STUDENT_UPDATE_FAILURE:
			return {
				error: action.error
			};

		case studentConstants.CLEAR:
				return {};
	
		default:
		return state
	}
}