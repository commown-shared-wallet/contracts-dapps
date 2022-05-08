import { expect } from "chai";
import chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);

import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import CommownSWProxyFactoryJSON from "../frontend/artifacts/contracts/CommownSWProxyFactory.sol/CommownSWProxyFactory.json";
import CommownSWJSON from "../frontend/artifacts/contracts/CommownSW.sol/CommownSW.json";
import { CommownSWProxyFactoryInterface } from "../typechain/CommownSWProxyFactory";
import {
    Contract,
    ContractFactory,
    ContractTransaction,
    ContractReceipt,
} from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let CommownSWProxyFactory: ContractFactory;
let proxyFactory: Contract;
let sign0: SignerWithAddress;
let sign1: SignerWithAddress;
let sign2: SignerWithAddress;
const addresses = [
    "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
];
const confirmation = 2;

describe("01_CommownSWProxyFactory__01_deployProxyFactory", function () {
    it("01_01_01: it deploys the CommownSWProxyFactory and the CommownSW", async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        proxyFactory = await CommownSWProxyFactory.deploy();

        await proxyFactory.deployed();

        expect(await proxyFactory.logic()).to.be.not.undefined;
        expect(await proxyFactory.logic()).to.be.not.null;
        expect(await proxyFactory.logic()).to.be.not.NaN;
    });
});

describe("01_CommownSWProxyFactory__02_createProxy", function () {
    let proxyCreated: ContractTransaction;
    let receipt: ContractReceipt;
    beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        proxyFactory = await CommownSWProxyFactory.deploy();

        await proxyFactory.deployed();

        [sign0, sign1] = await ethers.getSigners();
    });
    it("01__02-01: it deploys a proxy from sign0", async function () {
        proxyCreated = await proxyFactory.createProxy(addresses, confirmation);
        receipt = await proxyCreated.wait();
        console.log(
            receipt.events?.filter((x) => {
                return x.event == "ProxyCreated";
            })
        );
    });
    it("01__02-02: it deploys a proxy from sign0 and emit en event", async function () {
        await expect(proxyFactory.createProxy(addresses, confirmation)).to.emit(
            proxyFactory,
            "ProxyCreated"
        );
    });
    it("01__02-03: it deploys a proxy from sign1", async function () {
        await expect(
            proxyFactory.connect(sign1).createProxy(addresses, confirmation)
        ).to.emit(proxyFactory, "ProxyCreated");
    });
});

describe("01_CommownSWProxyFactory__03_stateVariable", function () {
    let proxyCreated: ContractTransaction;
    let receipt: ContractReceipt;
    let proxyCreatedAddress: String;

    beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        proxyFactory = await CommownSWProxyFactory.deploy();

        await proxyFactory.deployed();

        [sign0, sign1] = await ethers.getSigners();

        proxyCreated = await proxyFactory.createProxy(addresses, confirmation);
        receipt = await proxyCreated.wait();

        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;
    });

    it("01__03-01: it saves the proxy in the global proxiesList", async function () {
        expect(await proxyFactory.proxiesList(0)).to.be.not.empty;
        expect(await proxyFactory.proxiesList(0)).to.be.properAddress;
        expect(await proxyFactory.proxiesList(0)).to.be.equal(
            proxyCreatedAddress
        );
    });

    it("01__03-02: it saves the proxy in commownProxyPerUser for each 'owners'", async function () {
        expect(
            await proxyFactory.commownProxiesPerUser(addresses[0], 0)
        ).to.be.equals(proxyCreatedAddress);
        expect(
            await proxyFactory.commownProxiesPerUser(addresses[1], 0)
        ).to.be.equals(proxyCreatedAddress);
        expect(
            await proxyFactory.commownProxiesPerUser(addresses[2], 0)
        ).to.be.equals(proxyCreatedAddress);
    });

    it("01__03-03: it increments the nb of proxy for each 'owners'", async function () {
        expect(await proxyFactory.nbProxiesPerUser(addresses[0])).to.be.equals(
            1
        );
        expect(await proxyFactory.nbProxiesPerUser(addresses[1])).to.be.equals(
            1
        );
        expect(await proxyFactory.nbProxiesPerUser(addresses[2])).to.be.equals(
            1
        );
    });

    it("01__03-04: it handles multi wallet created per user i.e. multi proxies", async function () {
        const addressesSign1 = [
            "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
            "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
        ];
        const confirmationSign1 = 1;

        let proxyCreatedSign1: ContractTransaction = await proxyFactory
            .connect(sign1)
            .createProxy(addressesSign1, confirmationSign1);
        let receiptSign1: ContractReceipt = await proxyCreatedSign1.wait();

        let proxyCreatedAddressSign1: String = receiptSign1.events?.filter(
            (x) => {
                return x.event == "ProxyCreated";
            }
        )[0]?.args?.adrs;
        expect(await proxyFactory.proxiesList(1)).to.be.equal(
            proxyCreatedAddressSign1
        );
        expect(
            await proxyFactory.commownProxiesPerUser(addressesSign1[0], 1)
        ).to.be.equals(proxyCreatedAddressSign1);
        expect(
            await proxyFactory.commownProxiesPerUser(addressesSign1[1], 1)
        ).to.be.equals(proxyCreatedAddressSign1);
        expect(
            await proxyFactory.nbProxiesPerUser(addressesSign1[0])
        ).to.be.equals(2);
        expect(
            await proxyFactory.nbProxiesPerUser(addressesSign1[1])
        ).to.be.equals(2);
    });
});

//		const proxyCreated = await proxyFactory.createProxy(addresses,confirmation);
//		console.log(proxyCreated); //Returns a transaction

//If I continue like this, with the true proxy address, it works fine

// const MyContract = await ethers.getContractFactory("MyContract");
// const contract = await MyContract.attach("0x9f1ac54bef0dd2f6f3462ea0fa94fc62300d3a8e");
// expect(await proxyContract.confirmationNeeded()).to.equal(2); //true
// expect(await proxyContract.owners(1)).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0"); //False and dont know why yet

// describe('MyContract', function () {
//   it('deploys', async function () {

// 	const [addr0, addr1, addr2] = await ethers.getSigners();
// 	const MyContractV1 = await ethers.getContractFactory('MyContract');
// 	const addresses = ["0xbDA5747bFD65F08deb54cb465eB87D40e51B197E","0xdD2FD4581271e230360230F9337D5c0430Bf44C0","0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"];

// 	//addr0
// 	const myProxyV1 = await upgrades.deployProxy(MyContractV1, [addresses,10], { kind: 'uups' });
// 	await myProxyV1.deployed();

// 	console.log("myProxyV1.address : ",myProxyV1.address);
// 	console.log("myProxyV1._deployed : ",await myProxyV1.VERSION());

// 	expect(await myProxyV1.confirmationNeeded()).to.equal(10);
// 	expect(await myProxyV1.owner()).to.equal(addr0.address);
// 	expect(await myProxyV1.owners(1)).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0");

// 	//addr1
// 	//await myProxyV1.connect(addr1).

//   });
// });

/* describe('MyProxyFactory deployment', function () {
	it('deploys from addr0', async function () {
		//First we try to deploy the factory from addr0 (and by the code in the constructor the UUPS contract called MyContract)
		const [sign0, sign1, sign2] = await ethers.getSigners();
		const MyProxyFactory1 = await ethers.getContractFactory("MyProxyFactory");
		const proxyFactory1 = await MyProxyFactory1.deploy();
		await proxyFactory1.deployed();
  
	  	console.log("proxyFactory deployed to: ", proxyFactory1.address);
		console.log("Imprementation of MyContract: ", await proxyFactory1.logic());
		
		//expect(await proxyFactory1.admin()).to.equal(sign0.address);
	  	//expect(await proxyFactory1.x()).to.equal(100);
	});

	it('deploys from addr1', async function(){
		//2nd we try to deploy the factory from addr2 (and by the code in the constructor the UUPS contract called MyContract)
		const [sign0, sign1, sign2] = await ethers.getSigners();
		const MyProxyFactory2 = new ethers.ContractFactory(MyProxyFactory.abi, MyProxyFactory.bytecode, sign1);
		const proxyFactory2 = await MyProxyFactory2.deploy(200);
		await proxyFactory2.deployed();

		console.log("proxyFactory deployed to: ", proxyFactory2.address);
		console.log("Imprementation of MyContract: ", await proxyFactory2.logic());
		
		//expect(await proxyFactory2.admin()).to.equal(sign1.address);
	  	//expect(await proxyFactory2.x()).to.equal(200);
	});
});
 */

/* describe('MyProxyFactory creationProxy', function () {
	let sign0 : any;
	let sign1 : any;
	let sign2: any;
	let MyProxyFactory : any;
	let proxyFactory : any;
	
	const addresses = ["0xbDA5747bFD65F08deb54cb465eB87D40e51B197E","0xdD2FD4581271e230360230F9337D5c0430Bf44C0","0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"];
	const confirmation = 2;
		
	before(async function () {
		[sign0, sign1, sign2] = await ethers.getSigners();
		MyProxyFactory = await ethers.getContractFactory("MyProxyFactory");
		proxyFactory = await MyProxyFactory.deploy();
		await proxyFactory.deployed();
	});

	it("deploys a proxy from sign0", async function(){
		//We try to deploy a proxy of "MyContract" for user sign0
		const proxyCreated = await proxyFactory.createProxy(addresses,confirmation);
		
		const proxyAddress = await proxyFactory.proxiesList(0);
		console.log(proxyAddress);

		const proxyAddressOfUser = await proxyFactory.commownProxiesPerUser("0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",0);
		console.log(proxyAddressOfUser);
		
		//ça 
		const proxyContract = new ethers.Contract(proxyAddress,MyContract.abi,sign0); */

/** 
		 * et ça
		 * c'est pareil, les deux fonctionnent, mais il faut récup en dur l'adresse du proxyCreated,
		 * le return semble ne pas fonctionner, car il ramène une transaction et pas l'adresse du contrat
			const MyContract = await ethers.getContractFactory("MyContract");
			const contract = await MyContract.attach("0x9f1ac54bef0dd2f6f3462ea0fa94fc62300d3a8e");
		*/

/* console.log("Type ProxyContracy", typeof await proxyContract.owners(1));
		console.log("Type ProxyContracy", await proxyContract.owners(1));


		expect(await proxyContract.confirmationNeeded()).to.equal(2);
		expect(ethers.utils.getAddress(await proxyContract.owners(1))).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0");
		expect(await proxyContract.owners(1)).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0");
		
	}); */

// it("deploys a proxy from sign1", async function(){
// 	//We try to deploy a proxy of "MyContract" for user sign1
// 	const proxyCreated = await proxyFactory.connect(sign1).createProxy(addresses,confirmation);
// 	console.log("proxyCreated: ", proxyCreated);
// 	expect(await proxyCreated.confirmationNeeded()).to.equal(2);
// 	//expect(await proxyCreated.owner()).to.equal(sign1.address);
// 	//expect(await proxyCreated.owners(1)).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0");
// });

// it("deploys a proxy from sign2", async function(){
// 	//We try to deploy a proxy of "MyContract" for user sign2
// 	const proxyCreated = await proxyFactory.connect(sign2).createProxy(addresses,confirmation);
// 	console.log("proxyCreated: ", proxyCreated);
// 	expect(await proxyCreated.confirmationNeeded()).to.equal(2);
// 	//expect(await proxyCreated.owner()).to.equal(sign2.address);
// 	//expect(await proxyCreated.owners(1)).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0");
// });
//});
