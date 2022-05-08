import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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
