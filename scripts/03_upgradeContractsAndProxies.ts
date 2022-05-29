import "@nomiclabs/hardhat-ethers";
import { ethers, upgrades } from "hardhat";
import CommownSW from "../frontend/artifacts/contracts/CommownSW.sol/CommownSW.json";

/**
 * ==========> Do not launch <==========
 *
 * To define - other option if we do not want to use the OZ plugin
 * Though, it is safer to use the plugin as it will proceed a lot of security checks
 *
 * This script will :
 * 		- upgrade the main implementation by deploying new contract
 * 		- upgrade proxies manually
 */
async function main() {
    // 1. Deploy new implementation of CommownSW.sol
    // 2. Update CommownSWProxyFactory.sol to create new proxies with the new implementation address get on the first step
    // 3. Get all the proxies currently deployed
    // 4. Update for all the proxies the new implementation address get on the first step

	// All steps are tested in the test 01_CommownSWProxyFactory.ts
	
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
