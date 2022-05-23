import { CanNotHaveTwoDefaultAddressException, UploadAddressException } from "../exceptions/upload_address_exception";
import { AddressResponse } from "../interfaces/address_response_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase, UseCaseNoReturn } from "./base";

interface UploadAddressUseCaseParams {
    zip_code: string | null,
    street_name: string | null,
    street_number: string | null,
    city_id: number | null,
    default: boolean,
    description: string | null,
}

export default class UploadAdressUseCase implements UseCase<AddressResponse, UploadAddressUseCaseParams> {

    async call(params: UploadAddressUseCaseParams): Promise<AddressResponse> {
        let baseRepository: BaseRepository = new BaseRepository();

        let response: any = await baseRepository.post("api/v1/address/", {
            zip_code: params?.zip_code,
            street_name: params?.street_name,
            street_number: params?.street_number,
            city: params?.city_id,
            default: params?.default ?? false,
            description: params?.description
        });

        switch (response.status) {
            case 200:
                let addressResponse: AddressResponse = (await response.json())["data"];
                return addressResponse;
            case 400:
                throw new CanNotHaveTwoDefaultAddressException()
            default:
                throw new UploadAddressException();
        }
    }

}