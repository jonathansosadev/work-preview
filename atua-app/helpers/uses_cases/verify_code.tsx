import { SMSCodeNotMatchException, ValidateCodeException } from '../exceptions/verify_code_exception';
import { BaseRepository } from '../repositories/base_repository';
import { UseCaseNoReturn } from './base';


interface VerifyCodeUseCaseParams {
    phone: string;
    code: string;
}

export default class VerifyCodeUseCase implements UseCaseNoReturn<VerifyCodeUseCaseParams>{
    async call(params?: VerifyCodeUseCaseParams): Promise<void> {

        let baseRepository: BaseRepository = new BaseRepository();

        let response: any = await baseRepository.post("api/v1/phone/validate/", {
            phone: params?.phone,
            code: params?.code,
        });
        switch (response.status) {
            case 200:
                break;
            case 409:
                throw new SMSCodeNotMatchException();
            default:
                throw new ValidateCodeException();
        }
    }
}