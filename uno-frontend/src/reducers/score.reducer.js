import { scoreConstants } from '../constants';

export default function score(state = {}, action) {
	switch (action.type) {
		//Crear nota
		case scoreConstants.SCORE_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case scoreConstants.SCORE_CREATE_SUCCESS:
			return {
				register:true
			};
		case scoreConstants.SCORE_CREATE_FAILURE:
			return {};
	  
		//DataTable Notas
		case scoreConstants.SCORE_TABLE_REQUEST:
			return {
				loading: true
			};
		case scoreConstants.SCORE_TABLE_SUCCESS:
			return {
				data: action.scores,
				loading: false
			};
		case scoreConstants.SCORE_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//DataTable estudiantes
		case scoreConstants.STUDENT_TABLE_REQUEST:
			return {
				loading: true
			};
		case scoreConstants.STUDENT_TABLE_SUCCESS:
			return {
				data: action.data,
				loading: false
			};
		case scoreConstants.STUDENT_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//DataTable para asignar notas
		case scoreConstants.ASSIGN_TABLE_REQUEST:
			return {
				loading: true
			};
		case scoreConstants.ASSIGN_TABLE_SUCCESS:
			return {
				assign: action.scores,
				loading: false
			};
		case scoreConstants.ASSIGN_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener nota
		case scoreConstants.SCORE_GET_REQUEST:
			return {
				searching: true
			};
		case scoreConstants.SCORE_GET_SUCCESS:
			return {
				searched:true,
				score: action.score,
			};
		case scoreConstants.SCORE_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de nota
		case scoreConstants.SCORE_UPDATE_REQUEST:
			return {
				updating: true
			};
		case scoreConstants.SCORE_UPDATE_SUCCESS:
			return {
				success: true,
				// scoreUpdated: action.idScore,
			};
		case scoreConstants.SCORE_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//obtener notas del estudiante
		case scoreConstants.SCORE_STUDENT_REQUEST:
			return {
				searching: true
			};
		case scoreConstants.SCORE_STUDENT_SUCCESS:
			return {
				searched:true,
				scores: action.scores,
			};
		case scoreConstants.SCORE_STUDENT_FAILURE:
			return {
				error: action.error
			};

		//obtener carreras de estudiante para select
		case scoreConstants.CAREER_STUDENT_REQUEST:
			return {
				getting: true
			};
		case scoreConstants.CAREER_STUDENT_SUCCESS:
			return {
				obtained:true,
				list: action.list,
			};
		case scoreConstants.CAREER_STUDENT_FAILURE:
			return {
				error: action.error
			};
		case scoreConstants.CLEAR:
				return {};

		//obtener notas del estudiante desde admin
		case scoreConstants.SCORE_ADMIN_REQUEST:
			return {
				searching: true
			};
		case scoreConstants.SCORE_ADMIN_SUCCESS:
			return {
				searched:true,
				table: action.scores,
			};
		case scoreConstants.SCORE_ADMIN_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}