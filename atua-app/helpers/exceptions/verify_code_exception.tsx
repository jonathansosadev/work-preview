import { GeneralException } from './custom_exceptions';
import { useColorScheme as _useColorScheme } from 'react-native';


export class ValidateCodeException extends GeneralException {
    exceptionTitle = "Error de verificación de código";
    exceptionDescription = "No se pudo validar el código. Intente de nuevo más tarde."
}

export class SMSCodeNotMatchException extends ValidateCodeException {
    exceptionDescription = "El código de sms no coincide."
}