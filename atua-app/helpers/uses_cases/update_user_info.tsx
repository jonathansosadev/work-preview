import { CityDoesNotExist, UpdateUserInfoException } from "../exceptions/update_user_info_exception";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoReturn } from "./base";



interface UpdateUserInformationUseCaseParams {
    city_id: string,
    avatar: string,
}


export default class UpdateUserInformationUseCase implements UseCaseNoReturn<UpdateUserInformationUseCaseParams> {

    async call(params?: UpdateUserInformationUseCaseParams): Promise<void> {
        let baseRepository: BaseRepository = new BaseRepository();

        const formData = new FormData();

        formData.append("city_id", params!.city_id);
        formData.append("avatar", params!.avatar);

        let response: any = await baseRepository.post("api/v1/users/update_info/", formData, true);

        switch (response.status) {
            case 200:
                break;
            case 400:
                throw new CityDoesNotExist()
            default:
                throw new UpdateUserInfoException()
        }
    }
}