import { productConstants } from '../constants';

export default function products(state = {}, action) {
	switch (action.type) {
		//Crear producto
		case productConstants.PRODUCT_CREATE_REQUEST:
      		return { 
				registering: true 
			};
		case productConstants.PRODUCT_CREATE_SUCCESS:
			return {
				success: true
			  };
		case productConstants.PRODUCT_CREATE_FAILURE:
			return {};
	  
		//DataTable
		case productConstants.PRODUCT_TABLE_REQUEST:
			return {
				loading: true
			};
		case productConstants.PRODUCT_TABLE_SUCCESS:
			return {
				data: action.products,
				loading: false
			};
		case productConstants.PRODUCT_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener producto
		case productConstants.PRODUCT_GET_REQUEST:
			return {
				searching: true
			};
		case productConstants.PRODUCT_GET_SUCCESS:
			return {
				product: action.product,
			};
		case productConstants.PRODUCT_GET_FAILURE:
			return {
				error: action.error
			};

		//Actualización de producto
		case productConstants.PRODUCT_UPDATE_REQUEST:
			return {
				updating: true
			};
		case productConstants.PRODUCT_UPDATE_SUCCESS:
			return {
				success: true,
				productUpdated: action.product,
			};
		case productConstants.PRODUCT_UPDATE_FAILURE:
			return {
				error: action.error
			};

		//obtener productos select
		case productConstants.PRODUCT_SELECT_REQUEST:
			return {
				getting: true
			};
		case productConstants.PRODUCT_SELECT_SUCCESS:
			return {
				obtained:true,
				list: action.list,
			};
		case productConstants.PRODUCT_SELECT_FAILURE:
			return {
				error: action.error
			};

		//obtener productos select
		case productConstants.PRODUCT_OFFER_REQUEST:
			return {
				getting: true
			};
		case productConstants.PRODUCT_OFFER_SUCCESS:
			return {
				obtained:true,
				list: action.list,
			};
		case productConstants.PRODUCT_OFFER_FAILURE:
			return {
				error: action.error
			};
	
		default:
		return state
	}
}