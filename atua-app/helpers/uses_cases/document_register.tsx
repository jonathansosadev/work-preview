import { DocumentRegisterException } from '../exceptions/document_register_exception';
import { BaseRepository } from '../repositories/base_repository';
import { UseCaseNoReturn } from './base';


interface DocumentRegisterUseCaseParams {
    document_type: string;
    document_number: string;
    document_expiration: string;
    document_picture_front: string;
    document_picture_back: string;
}

export default class DocumentRegisterUseCase implements UseCaseNoReturn<DocumentRegisterUseCaseParams>{
    async call(params?: DocumentRegisterUseCaseParams): Promise<void> {

        let baseRepository: BaseRepository = new BaseRepository();

        const formData = new FormData();

        formData.append("document_type", params!.document_type);
        formData.append("document_number", params!.document_number);
        formData.append("document_expiration", params!.document_expiration);
        formData.append("document_picture_front", params!.document_picture_front);
        formData.append("document_picture_back", params!.document_picture_back);

        let response: any = await baseRepository.post("api/v1/users/documents/register/", formData, true)

        switch (response.status) {
            case 200:
                break;
            default:
                throw new DocumentRegisterException();
        }
    }
}