import { Country } from "./countries_interface";

export interface Provinces {
    code_transaction: string;
    data: Province[];
}

export interface Province {
    id: number;
    name: string;
    country: Country
}
