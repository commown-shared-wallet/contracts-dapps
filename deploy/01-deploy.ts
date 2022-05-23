import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const CommownSWProxyFactory = await ethers.getContractFactory(
        "CommownSWProxyFactory"
    );

    //Instance of Voting contract
    const commownSWProxyFactory = await CommownSWProxyFactory.deploy();

    //waiting of contract deployment
    await commownSWProxyFactory.deployed();

    console.log(
        "Commown Shared Wallet Proxy Factory deployed to:",
        commownSWProxyFactory.address
    );
};
export default func;
