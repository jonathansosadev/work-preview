import { UseCaseNoParams } from './base';
import { DocumentTypesInterface } from '../interfaces/document_types_interface';
import { BaseRepository } from '../repositories/base_repository';
import { DocumentTypeException } from '../exceptions/document_type_exception';


export default class DocumentTypeUseCase implements UseCaseNoParams<DocumentTypesInterface> {
    async call(): Promise<DocumentTypesInterface> {

        let baseRepository: BaseRepository = new BaseRepository();

        let response: any = await baseRepository.get("api/v1/document_types/");

        switch (response.status) {
            case 200:
                let documentTypes: DocumentTypesInterface = await response.json();
                return documentTypes;
            default:
                throw new DocumentTypeException();
        }
    }

}