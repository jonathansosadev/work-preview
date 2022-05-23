import { BaseRepository } from '../repositories/base_repository';
import { UseCaseNoReturn } from './base';
import { ChangePasswordException, NoMatchOldPassword } from '../exceptions/change_password_exceptions';


export interface ChangePasswordUseCaseParams {
    password_old: string;
    password_new: string;
}


export default class ChangePasswordUseCase implements UseCaseNoReturn<ChangePasswordUseCaseParams>{


    async call(params?: ChangePasswordUseCaseParams): Promise<void> {
        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.post("api/v1/users/change_password/", {
            password_old: params?.password_old,
            password_new: params?.password_new
        });
        switch (response.status) {
            case 200:
                let res = await response.json();
                if (res.data.data == "NOT_MATCH_PASSWORD_OLD") {
                    throw new NoMatchOldPassword();
                }
                break;
            default:
                throw new ChangePasswordException();
        }
    }

}