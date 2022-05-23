import MyCarsListException from "../exceptions/my_cars_list_exception";
import { MyCarsResponse } from "../interfaces/my_cars_response";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";

interface MyCarsListQueryParams {
    id?: string | undefined,
    date_created?: string | undefined,
    date_from?: string | undefined,
    date_to?: string | undefined,
    transmission?: string | undefined,
    doors?: string | undefined,
    fuel_type?: string | undefined,
    status_car?: string | undefined,
}

export default class MyCarsListUseCase implements UseCase<MyCarsResponse, MyCarsListQueryParams> {

    async call(params?: MyCarsListQueryParams | undefined): Promise<MyCarsResponse> {

        let baseRepository: BaseRepository = new BaseRepository();

        let response: any = await baseRepository.get(`api/v1/cars/my_cars/?id=${params?.id ?? ""}&date_created=${params?.date_created ?? ""}&date_from=${params?.date_from ?? ""}&date_to=${params?.date_to ?? ""}&transmission=${params?.transmission ?? ""}&doors=${params?.doors ?? ""}&fuel_type=${params?.fuel_type ?? ""}&status_car=${params?.status_car ?? ""}`);

        switch (response.status) {
            case 200:
                let myCarsResponse: MyCarsResponse = await response.json();
                return myCarsResponse;
            default:
                throw new MyCarsListException();
        }
    }

}