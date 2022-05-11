import { ethers } from "ethers";

export interface IDepositEvent {
    sender: string;
    amount: ethers.BigNumber;
    userBalance: ethers.BigNumber;
    balance: ethers.BigNumber;
}
export interface IDepositEvents extends Array<IDepositEvent> {}
