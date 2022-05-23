import { GeneralException } from './custom_exceptions';

export class SendCodeException extends GeneralException {
    exceptionTitle = "Error al enviar código";
    exceptionDescription = "No pudimos enviarte el código. Intenta de nuevo más tarde"
}