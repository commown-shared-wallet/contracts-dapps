import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners(); //get the account to deploy the contract

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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); // Calling the function to deploy the contract
