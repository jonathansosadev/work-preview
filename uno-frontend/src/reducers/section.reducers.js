import { sectionConstants } from '../constants/section.constants';

export default function sections(state = {}, action) {
	switch (action.type) {
		//Crear clase
		case sectionConstants.SECTION_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case sectionConstants.SECTION_CREATE_SUCCESS:
			return {};
		case sectionConstants.SECTION_CREATE_FAILURE:
			return {};

		//DataTable
		case sectionConstants.SECTION_TABLE_REQUEST:
			return {
				loading: true
			};
		case sectionConstants.SECTION_TABLE_SUCCESS:
			return {
				data: action.sections,
				loading: false
			};
		case sectionConstants.SECTION_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener seccion
		case sectionConstants.SECTION_GET_REQUEST:
			return {
				searching: true
			};
		case sectionConstants.SECTION_GET_SUCCESS:
			return {
				searched:true,
				section: action.section,
			};
		case sectionConstants.SECTION_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de materia
		case sectionConstants.SECTION_UPDATE_REQUEST:
			return {
				updating: true
			};
		case sectionConstants.SECTION_UPDATE_SUCCESS:
			return {
				success: true,
				sectionUpdated: action.section,
			};
		case sectionConstants.SECTION_UPDATE_FAILURE:
			return {
				error: action.error
			};

	
		default:
		return state
	}
}