import { Brand } from "./brand_cars_interfaces";

export interface ModelsCars {
    data: Cars[];
}

export interface Cars {
    brand: Brand;
    logo_url: null;
    id: number;
    description: string;
    price_from: string;
    price_to: string;
    summary: string;
}

