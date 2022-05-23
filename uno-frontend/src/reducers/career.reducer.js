import { careerConstants } from '../constants';

export default function careers(state = {}, action) {
	switch (action.type) {
		//Crear agencia
		case careerConstants.CAREER_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case careerConstants.CAREER_CREATE_SUCCESS:
			return {
				saved: true,
			};
		case careerConstants.CAREER_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case careerConstants.CAREER_TABLE_REQUEST:
			return {
				loading: true
			};
		case careerConstants.CAREER_TABLE_SUCCESS:
			return {
				data: action.careers,
				loading: false
			};
		case careerConstants.CAREER_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener carrera
		case careerConstants.CAREER_GET_REQUEST:
			return {
				searching: true
			};
		case careerConstants.CAREER_GET_SUCCESS:
			return {
				searched:true,
				career: action.career,
			};
		case careerConstants.CAREER_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de sede
		case careerConstants.CAREER_UPDATE_REQUEST:
			return {
				updating: true
			};
		case careerConstants.CAREER_UPDATE_SUCCESS:
			return {
				success: true,
				careerUpdated: action.career,
			};
		case careerConstants.CAREER_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//obtener carreras select
		case careerConstants.CAREER_SELECT_REQUEST:
			return {
				getting: true
			};
		case careerConstants.CAREER_SELECT_SUCCESS:
			return {
				obtained:true,
				list: action.list,
			};
		case careerConstants.CAREER_SELECT_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}