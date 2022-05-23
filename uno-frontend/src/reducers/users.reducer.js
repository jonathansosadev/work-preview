import { userConstants } from '../constants';

export default function users(state = {}, action) {
  switch (action.type) {
    case userConstants.GETALL_REQUEST:
      return {
        loading: true
      };
    case userConstants.GETALL_SUCCESS:
      return {
        items: action.users
      };
    case userConstants.GETALL_FAILURE:
      return { 
        error: action.error
      };
    case userConstants.DELETE_REQUEST:
      // agregar propiedad 'deleting:true' al usuario que se está eliminando
      return {
        ...state,
        items: state.items.map(user =>
          user.id === action.id
            ? { ...user, deleting: true }
            : user
        )
      };
    case userConstants.DELETE_SUCCESS:
      // quitar usuario eliminado del state
      return {
        items: state.items.filter(user => user.id !== action.id)
      };
    case userConstants.DELETE_FAILURE:
      // quitar propiedad 'deleting:true' y agregar propiedad 'deleteError:[error]' al usuario
      return {
        ...state,
        items: state.items.map(user => {
          if (user.id === action.id) {
            // hacer una copia de user sin la propiedad 'deleting:true'
            const { deleting, ...userCopy } = user;
            // retornar una copia de user con la propiedad 'deleteError:[error]' property
            return { ...userCopy, deleteError: action.error };
          }

          return user;
        })
      };

    //Enivar email de cambio de contraseña
    case userConstants.FORGOT_REQUEST:
      return {
        loading: true
      };
    case userConstants.FORGOT_SUCCESS:
      return {};
    case userConstants.FORGOT_FAILURE:
      return { 
        error: action.error
      };

    //Validar token para cambiar contraseña
    case userConstants.RESET_REQUEST:
      return {
        loading: true
      };
    case userConstants.RESET_SUCCESS:
      return {};
    case userConstants.RESET_FAILURE:
      return { 
        error: action.error
      };

    //Cambio de contraseña
    case userConstants.RESTORE_REQUEST:
      return {
        loading: true
      };
    case userConstants.RESTORE_SUCCESS:
      return {};
    case userConstants.RESTORE_FAILURE:
      return { 
        error: action.error
      };

    //Actualización de información
    case userConstants.UPDATE_DATA_REQUEST:
      return {
        updating: true
      };
    case userConstants.UPDATE_DATA_SUCCESS:
      return {
        success: true,
        userUpdated: action.user,
      };
    case userConstants.UPDATE_DATA_FAILURE:
      return {
        error: action.error
      };

    //Carga de imagen de perfil
    case userConstants.UPLOAD_IMAGE_REQUEST:
      return {
        uploading: true
      };
    case userConstants.UPLOAD_IMAGE_SUCCESS:
      return {
        uploaded: true,
        userUpdated: action.user,
      };
    case userConstants.UPLOAD_IMAGE_FAILURE:
      return {
        error: action.error
      };
   
    default:
      return state
  }
}