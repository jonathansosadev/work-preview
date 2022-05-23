import UploadDocumentsCarsException from "../exceptions/upload_document_cars_exceptions";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoReturn } from "./base";

interface UploadDocumentsCarsUseCaseParams {
    car: number,
    picture_mechanical_check: string,
    picture_insurance: string,
    picture_driver_card: string,
}


export default class UploadDocumentsCarsUseCase implements UseCaseNoReturn<UploadDocumentsCarsUseCaseParams> {

    async call(params: UploadDocumentsCarsUseCaseParams): Promise<void> {

        let baseRepository: BaseRepository = new BaseRepository();
        const formData = new FormData();

        let typePictureMechanicalCheck = params!.picture_mechanical_check.split("/").pop()?.split(".")[1];
        let typePictureInsurance = params!.picture_insurance.split("/").pop()?.split(".")[1];
        let typePictureDriverCard = params!.picture_driver_card.split("/").pop()?.split(".")[1];

        formData.append("car", params!.car.toString());
        formData.append("picture_mechanical_check", { uri: params!.picture_mechanical_check, type: `image/${typePictureMechanicalCheck}`, name: typePictureMechanicalCheck });
        formData.append("picture_insurance", { uri: params!.picture_insurance, type: `image/${typePictureInsurance}`, name: typePictureInsurance });
        formData.append("picture_driver_card", { uri: params!.picture_driver_card, type: `image/${typePictureDriverCard}`, name: typePictureDriverCard });

        let response: any = await baseRepository.postFormData("api/v1/cars/documents/", formData)

        switch (response!.status) {
            case 200:
                break;
            default:
                throw new UploadDocumentsCarsException();
        }
    }
}