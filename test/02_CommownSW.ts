import { expect } from "chai";
import chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);

import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { CommownSWProxyFactoryInterface } from "../typechain/CommownSWProxyFactory";
import {
    Contract,
    ContractFactory,
    ContractTransaction,
    ContractReceipt,
} from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC1967Proxy, ERC1967Proxy__factory } from "../typechain";
import { PocketProvider } from "@ethersproject/providers";
import { parseEther } from "ethers/lib/utils";

let CommownSWProxyFactory: ContractFactory;
let CSWProxyFactoryContract: Contract;
let CommownSW: ContractFactory;
let CSWContract: Contract;
let sign0: SignerWithAddress;
let sign1: SignerWithAddress;
let sign2: SignerWithAddress;
let sign3: SignerWithAddress;

const addresses1 = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
];
const addresses2 = [
    "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
];
const confirmation = 2;
let proxyCreated: ContractTransaction;
let receipt: ContractReceipt;
let proxyCreatedAddress: string;

describe("02_CommownSW__01_deployementAndInitializer", function () {
    beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
		expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1] = await ethers.getSigners();

		proxyCreated = await CSWProxyFactoryContract.createProxy(addresses1, confirmation);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

		expect(proxyCreatedAddress).to.be.not.undefined;

		CommownSW = await ethers.getContractFactory("CommownSW");
		CSWContract = CommownSW.attach(proxyCreatedAddress);
    });
	
	it("02__01-01: in the proxy it reads the initialize state of CommownSW", async function () {
		expect(await CSWContract.VERSION()).to.equal("0.0.1");
		
		expect(await CSWContract.isOwner(addresses1[0])).to.be.true;
		expect(await CSWContract.isOwner(addresses1[1])).to.be.true;
		expect(await CSWContract.isOwner(addresses1[2])).to.be.true;
		expect(await CSWContract.isOwner(addresses2[0])).to.be.false;
		expect(await CSWContract.isOwner(addresses2[1])).to.be.false;
		
		expect(await CSWContract.owners(0)).to.be.equal(addresses1[0]);
		expect(await CSWContract.owners(1)).to.be.equal(addresses1[1]);
		expect(await CSWContract.owners(2)).to.be.equal(addresses1[2]);

		expect(await CSWContract.confirmationNeeded()).to.equal(2);
    });
	it("02__01-02: Owner(Admin) of CommownSW is ProxyFactory", async function () {
		expect(await CSWContract.owner()).to.be.equals(CSWProxyFactoryContract.address);
		//How to change the admin of it
    });
	it("02__01-03: it handles different state per proxy", async function () {
		proxyCreated = await CSWProxyFactoryContract.createProxy(addresses2, confirmation);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

		expect(proxyCreatedAddress).to.be.not.undefined;
		let CSWContract2 = CommownSW.attach(proxyCreatedAddress);

		expect(await CSWContract.isOwner(addresses1[0])).to.be.true;
		expect(await CSWContract.isOwner(addresses1[1])).to.be.true;
		expect(await CSWContract.isOwner(addresses1[2])).to.be.true;
		expect(await CSWContract.isOwner(addresses2[0])).to.be.false;
		expect(await CSWContract.isOwner(addresses2[1])).to.be.false;
		expect(await CSWContract.isOwner(addresses2[2])).to.be.false;
		expect(await CSWContract2.isOwner(addresses2[0])).to.be.true;
		expect(await CSWContract2.isOwner(addresses2[1])).to.be.true;
		expect(await CSWContract2.isOwner(addresses2[2])).to.be.true;
		expect(await CSWContract2.isOwner(addresses1[0])).to.be.false;
		expect(await CSWContract2.isOwner(addresses1[1])).to.be.false;
		expect(await CSWContract2.isOwner(addresses1[2])).to.be.false;
    });
	
});

/* describe("02_CommownSW__02_ReceiveAndWithdrawETH", function () {
	beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
		expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1] = await ethers.getSigners();

		proxyCreated = await CSWProxyFactoryContract.createProxy(addresses1, confirmation);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

		expect(proxyCreatedAddress).to.be.not.undefined;

		CommownSW = await ethers.getContractFactory("CommownSW");
		CSWContract = CommownSW.attach(proxyCreatedAddress);
    });
	it("02__02-01: it receives ETH for a CSW owner, update his balance and update the global balance", async function () {
		
    });
	it("02__02-02: it does not receive ETH for a non CSW owner, or 0 wei sent, balances remain unchange", async function () {
		
    });
	it("02__02-03: it emits an event when receiving ETH", async function () {
		
    });
	it("02__02-04: it withdraw ETH for a CSW owner and update balances", async function () {
		 
    });
	it("02__02-05: it does not withdraw ETH for a non CSW owner, or 0 wei asked, balances remain unchanged", async function () {
		
    });
	it("02__02-06: it emits an event when withdrawing ETH", async function () {
		
    });
}); */


describe("02_CommownSW__03_createPocket", function () {
	let addressTo: string;
	let bytesData: string;
	let totalAmount: number;

	beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
		expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1, sign2, sign3] = await ethers.getSigners();

		proxyCreated = await CSWProxyFactoryContract.createProxy(addresses1, confirmation);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

		expect(proxyCreatedAddress).to.be.not.undefined;

		CommownSW = await ethers.getContractFactory("CommownSW");
		CSWContract = CommownSW.attach(proxyCreatedAddress);
		
		addressTo = "0xd9145CCE52D386f254917e481eB44e9943F39138";
		totalAmount = 100;
		let ABITest = ["function callMe(uint x) "];
		let iface = new ethers.utils.Interface(ABITest);
		bytesData = iface.encodeFunctionData("callMe", [2]);
		//0xe73620c30000000000000000000000000000000000000000000000000000000000000002
		//parseEther("1.0") 
    });
	it("02__03-01: it proposes a Pocket which can be retrieve from array", async function () {
		const proposePocketTx = await CSWContract.proposePocket(addressTo,bytesData,totalAmount,addresses1,[25,50,25]);
		await proposePocketTx.wait();
		
		const pocket0 =	await CSWContract.pockets(0);
		expect(pocket0.to).to.be.equal(addressTo);
		expect(pocket0.data).to.be.equal(bytesData);
		expect(pocket0.pStatus).to.be.equal(0);
		expect(pocket0.totalAmount).to.be.equal(totalAmount);
    });
	it("02__03-02: it proposes a Pocket which can be retrieve from emitted event", async function () {
		const proposePocketTx = await CSWContract.proposePocket(addressTo,bytesData,totalAmount,addresses1,[25,50,25]);
		receipt = await proposePocketTx.wait();

		let pocket0created = receipt.events?.filter((x) => {
            return x.event == "ProposePocket";
        })[0]?.args; //?.adrs;
		
		expect(pocket0created?.sender).to.be.equal(sign0.address);
		expect(pocket0created?.pocketID).to.be.equal(0);
		expect(pocket0created?.to).to.be.equal(addressTo);
		expect(pocket0created?.data).to.be.equal(bytesData);
		expect(pocket0created?.totalAmount).to.be.equal(totalAmount);
	});
	it("02__03-03: it handles all requirement and revert if not validated", async function () {
		//isCommownOwner
		await expect(
			CSWContract.connect(sign3).proposePocket(addressTo,bytesData,totalAmount,addresses1,[25,50,25])
		).to.be.revertedWith("not an owner");

		//_users.length 
		await expect(
			CSWContract.proposePocket(addressTo,bytesData,totalAmount,[],[25,50,25])
		).to.be.revertedWith("owners required");

		//_users.length = _sharePerUser.length
		await expect(
			CSWContract.proposePocket(addressTo,bytesData,totalAmount,addresses1,[25,50])
		).to.be.revertedWith("length mismatch");

		//isOwner[_users[i]]
		await expect(
			CSWContract.proposePocket(addressTo,bytesData,totalAmount,["0xd9145CCE52D386f254917e481eB44e9943F39138"],[25])
		).to.be.revertedWith("not an owner");
		
	});
});

