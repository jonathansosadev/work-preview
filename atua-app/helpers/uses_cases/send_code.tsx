import { SendCodeException } from '../exceptions/send_code_exception';
import { BaseRepository } from '../repositories/base_repository';
import { UseCaseNoReturn } from './base';

interface SendCodeUseCaseParams {
    phone: string;
}

export default class SendCodeUseCase implements UseCaseNoReturn<SendCodeUseCaseParams> {

    async call(params: SendCodeUseCaseParams): Promise<void> {

        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.post("api/v1/phone/sendcode/", {
            phone: params.phone
        });
        switch (response.status) {
            case 200:
                break;
            default:
                throw new SendCodeException()
        }
    }

}