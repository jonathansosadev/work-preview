import { notificationConstants } from '../constants';

export default function reference(state = {}, action) {
	switch (action.type) {
	  
		//Crear notificacion
		case notificationConstants.NOTIFICATION_CREATE_REQUEST:
      		return { 
				registering: true,
			};
		case notificationConstants.NOTIFICATION_CREATE_SUCCESS:
			return {
				success: true,
			};
		case notificationConstants.NOTIFICATION_CREATE_FAILURE:
			return {
				error: action.error
			};

		//DataTable Notificaciones 
		case notificationConstants.NOTIFICATION_TABLE_REQUEST:
			return {
				loading: true
			};
		case notificationConstants.NOTIFICATION_TABLE_SUCCESS:
			return {
				data: action.data,
				loading: false
			};
		case notificationConstants.NOTIFICATION_TABLE_FAILURE:
			return { 
				error: action.error,
				loading: false
			};

		//obtener notificacion
		case notificationConstants.NOTIFICATION_GET_REQUEST:
			return {
				searching: true
			};
		case notificationConstants.NOTIFICATION_GET_SUCCESS:
			return {
				searched:true,
				notification: action.notification,
			};
		case notificationConstants.NOTIFICATION_GET_FAILURE:
			return {
				error: action.error
			};

		//Eliminar notificacion
		case notificationConstants.NOTIFICATION_DELETE_REQUEST:
			return {
				deleting: true
			};
		case notificationConstants.NOTIFICATION_DELETE_SUCCESS:
			return {
				deleted:true,
			};
		case notificationConstants.NOTIFICATION_DELETE_FAILURE:
			return {
				error: action.error
			};

		//Actualización de notificación
		case notificationConstants.NOTIFICATION_UPDATE_REQUEST:
			return {
				updating: true
			};
		case notificationConstants.NOTIFICATION_UPDATE_SUCCESS:
			return {
				success: true,
				notificationUpdated: action.notification,
			};
		case notificationConstants.NOTIFICATION_UPDATE_FAILURE:
			return {
				error: action.error
			};

		case notificationConstants.CLEAR:
			return {};

	
		default:
		return state
	}
}