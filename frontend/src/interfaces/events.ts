import { ethers } from "ethers";

export interface IDepositEvent {
    sender: string;
    amount: ethers.BigNumber;
    userBalance: ethers.BigNumber;
    balance: ethers.BigNumber;
}
export interface IDepositEvents extends Array<IDepositEvent> {}

export interface IProxyCreated {
    adrs: string;
    owners: string[];
}

export interface IUserCSW {
    assets: string;
    address: string;
    userBalance: number;
}

export interface IUsersCSW extends Array<IUserCSW> {}

export interface IProposePocket {
    sender: string;
    pocketID: ethers.BigNumber;
    to: string;
    data: ethers.BigNumber;
    PocketStatus: any;
    totalAmount: ethers.BigNumber;
    sharePerUser: Array<number>;
}
