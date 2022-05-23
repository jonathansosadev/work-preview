import { GeneralException } from "./custom_exceptions";

export default class UploadExteriorPicturesCarsException extends GeneralException {
    exceptionTitle = "Error al subir las fotografias";
    exceptionDescription = "No se pudo subir las fotos. Intenta de nuevo más tarde";
}