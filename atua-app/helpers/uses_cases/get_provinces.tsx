import { GetProvinceException } from "../exceptions/get_provices_exceptions";
import { Provinces } from "../interfaces/provinces_interfaces";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";

interface GetProvincesParams {
    country_id?: number|undefined;
}

export default class GetProvincesUseCase implements UseCase<Provinces, GetProvincesParams>{
    async call(params: GetProvincesParams): Promise<Provinces> {
        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.get(`api/v1/province/?country_id=${params.country_id??""}`);
        switch (response.status) {
            case 200:
                let provinces: Provinces = await response.json();
                return provinces;
            default:
               throw new GetProvinceException();
        }
    }

}