import UploadInteriorPicturesCarsException from "../exceptions/upload_interior_pictures_cars_exception";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoReturn } from "./base";

interface UploadInteriorPicturesCarsParamsUseCase {
    car: number,
    picture_dashboard: string,
    picture_interior_front: string,
    picture_interior_back: string,
    picture_trunk: string,
}

export default class UploadInteriorPicturesCarsUseCase implements UseCaseNoReturn<UploadInteriorPicturesCarsParamsUseCase>{

    async call(params?: UploadInteriorPicturesCarsParamsUseCase): Promise<void> {

        let baseRepository: BaseRepository = new BaseRepository();
        const formData = new FormData();
        let typePictureDashBoard = params!.picture_dashboard.split("/").pop()?.split(".")[1];
        let typePictureInteriorBack = params!.picture_interior_back.split("/").pop()?.split(".")[1];
        let typePictureInteriorFront = params!.picture_interior_front.split("/").pop()?.split(".")[1];
        let typePictureTrunck = params!.picture_trunk.split("/").pop()?.split(".")[1];


        formData.append("car", params!.car.toString());
        formData.append("picture_dashboard", { uri: params!.picture_dashboard, type: `image/${typePictureDashBoard}`, name: typePictureDashBoard });
        formData.append("picture_interior_front", { uri: params!.picture_interior_front, type: `image/${typePictureInteriorFront}`, name: typePictureInteriorFront });
        formData.append("picture_interior_back", { uri: params!.picture_interior_back, type: `image/${typePictureInteriorBack}`, name: typePictureInteriorBack });
        formData.append("picture_trunk", { uri: params!.picture_trunk, type: `image/${typePictureTrunck}`, name: typePictureTrunck });

        let response: any = await baseRepository.postFormData("api/v1/cars/documents_interior/", formData)

        switch (response.status) {
            case 200:
                break;
            default:
                throw new UploadInteriorPicturesCarsException();
        }
    }
}