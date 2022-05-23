export interface IUserWithShare {
    address: string;
    share: number;
}
export interface IUsersWithShare extends Array<IUserWithShare> {}

export interface INftData {
    image: string;
    description: string;
    name: string;
}
