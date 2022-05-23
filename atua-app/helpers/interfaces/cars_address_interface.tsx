export interface CarsAddress {
    count: number;
    next: string | undefined;
    previous: string | undefined;
    results: CarAddress[];
}

export interface CarAddress {
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
