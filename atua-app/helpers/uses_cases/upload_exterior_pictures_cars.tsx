import UploadExteriorPicturesCarsException from "../exceptions/upload_exterior_pictures_cars_exception";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoReturn } from "./base";

interface UploadExteriorPicturesCarsParamsUseCase {
    car: number,
    picture_front: string,
    picture_back: string,
    picture_right: string,
    picture_left: string,
}

export default class UploadExteriorPicturesCarsUseCase implements UseCaseNoReturn<UploadExteriorPicturesCarsParamsUseCase>{

    async call(params?: UploadExteriorPicturesCarsParamsUseCase): Promise<void> {

        let baseRepository: BaseRepository = new BaseRepository();
        const formData = new FormData();


        let typePictureFront = params!.picture_front.split("/").pop()?.split(".")[1];
        let typePictureBack = params!.picture_back.split("/").pop()?.split(".")[1];
        let typePictureRight = params!.picture_right.split("/").pop()?.split(".")[1];
        let typePictureLeft = params!.picture_left.split("/").pop()?.split(".")[1];


        formData.append("car", params!.car.toString());
        formData.append("picture_front", { uri: params!.picture_front, type: `image/${typePictureFront}`, name: typePictureFront });
        formData.append("picture_back", { uri: params!.picture_back, type: `image/${typePictureBack}`, name: typePictureBack });
        formData.append("picture_right", { uri: params!.picture_right, type: `image/${typePictureRight}`, name: typePictureRight });
        formData.append("picture_left", { uri: params!.picture_left, type: `image/${typePictureLeft}`, name: typePictureLeft });

        let response: any = await baseRepository.postFormData("api/v1/cars/documents_exterior/", formData)

        switch (response.status) {
            case 200:
                break;
            default:
                throw new UploadExteriorPicturesCarsException();
        }
    }
}