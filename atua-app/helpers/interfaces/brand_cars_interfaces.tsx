export interface BrandCarsInterface {
    data: Brand[];
}

export interface Brand {
    id: number;
    logo_url: null | string;
    name: string;
    prices_from: number | null;
    prices_to: number | null;
    summary: string;
}
