export interface Params { }

export abstract class UseCase<T, Params> {
    async call(params: Params): Promise<T> { throw new Error(); };
}

export abstract class UseCaseNoParams<T> {
    async call(): Promise<T> { throw new Error(); };
}

export abstract class UseCaseNoReturn<Params> {
    async call(params?: Params | undefined): Promise<void> { throw new Error(); };
}