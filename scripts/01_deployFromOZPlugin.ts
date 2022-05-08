import "@nomiclabs/hardhat-ethers";
import { ethers, upgrades } from "hardhat";
import CommownSW from "../frontend/artifacts/contracts/CommownSW.sol/CommownSW.json";

/**
 * ==========> Do not launch <==========
 *
 * Only launchable for plugin usage in OpenZeppelin mode
 *
 * This script will :
 * 		- deploy the logic contract "CommownSW" if it isn't already deployed
 * 		- a proxy of that contrac for the signer of the transaction with parameters adresses and nb of signature required
 */
async function main() {
    const [owner] = await ethers.getSigners();

    // Create an instance of a Contract Factory with owner in parameters
    // Other choice of instruction :
    // let factory = await ethers.getContractFactory('CommownSW');
    let factory = new ethers.ContractFactory(
        CommownSW.abi,
        CommownSW.bytecode,
        owner
    );
    const addresses = [
        "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
        "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
        "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    ];
    const confirmation = 2;

    // Notice we pass the parameters to the constructor
    // which will be initialize by the function with same name
    // kind : uups because of the choice made for that project to use Uups proxies
    let proxy = await upgrades.deployProxy(factory, [addresses, confirmation], {
        kind: "uups",
    });

    //waiting of proxy deployment
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
