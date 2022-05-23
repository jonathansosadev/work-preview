export interface UserDetailsInterface {
    code_transaction: string;
    data: Data;
}

export interface Data {
    basic_info: BasicInfo;
    terms_info: TermsInfo;
    current_account?: string | undefined;
    confirmation_needed: string;
    address?: Address | undefined;
    licence_driver?: DocumentInformation | undefined;
    document_send: string;
    signed_contract: string;
    documents: DocumentInformation[];
}

export interface BasicInfo {
    avatar?: string | undefined;
    is_email_verified?: string | undefined;
    date_of_birth: string;
    phone: string;
    user: User;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

export interface DocumentInformation {
    document_type: number;
    document_expiration: string;
    document_picture_front: string;
    document_picture_back: string;
    status: string;
}

export interface TermsInfo {
    accepted_date?: string | undefined;
    status: string;
}


export interface Address {
    id: number;
    zip_code: string;
    street_name: string;
    street_number: string;
    city: City;
    description: string;
    default: boolean;
}

export interface City {
    id: number;
    name: string;
    province: Province;
}

export interface Province {
    id: number;
    name: string;
    country: Country;
}

export interface Country {
    id: number;
    name: string;
}
