export interface DocumentTypesInterface {
    code_transaction: string;
    data: Data;
}

export interface Data {
    count: number;
    next?: string | undefined;
    previous?: string | undefined;
    results: Documents[];
}

export interface Documents {
    id: number;
    initials: string;
    name: string;
}
