import "@nomiclabs/hardhat-ethers";
import { ethers, upgrades } from "hardhat";
import CommownSW from "../frontend/artifacts/contracts/CommownSW.sol/CommownSW.json";

/**
 * ==========> Do not launch <==========
 *
 * Only launchable for plugin usage in OpenZeppelin mode
 *
 * This script will :
 * 		- upgrade a proxy giving it the new implementation of the logic contract "CommownSW"
 * 		- it requires a launch only in OZ program, and only works for proxies created by that plugin
 * 		- that means proxies created in a solidity proxy factory have to be updated in another scripts using "force"
 */
async function main() {
    // We get the contract to deploy, i.e. : CommownSWV2
    const CommownSWV2 = await ethers.getContractFactory("CommownSWV2");

    // Get the proxy address to upgrade
    const PROXY = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";

    const proxy = await upgrades.upgradeProxy(PROXY, CommownSWV2);
    await proxy.deployed();

    console.log("CommownSW's Proxy deployed to: " + proxy.address);
    console.log(
        "CommownSW's Implementation (main contract) deployed to: ",
        await upgrades.erc1967.getImplementationAddress(proxy.address)
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
