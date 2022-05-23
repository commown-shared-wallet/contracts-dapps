import { expect } from "chai";
import chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);

import "@nomiclabs/hardhat-ethers";
import { ethers, upgrades } from "hardhat";
import { CommownSWProxyFactoryInterface } from "../frontend/types/CommownSWProxyFactory";
import {
    Contract,
    ContractFactory,
    ContractTransaction,
    ContractReceipt,
} from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let CommownSWProxyFactory: ContractFactory;
let proxyFactory: Contract;
let CommownSW: ContractFactory;
let sign0: SignerWithAddress;
let sign1: SignerWithAddress;
let sign2: SignerWithAddress;
const addresses = [
    "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
];
const confirmation = 2;

let bytesData: string;
let ABITest = ["function initialize(address[] memory _owners, uint8 _confirmationNeeded, address _admin)"];
let iface = new ethers.utils.Interface(ABITest);

describe("01_CommownSWProxyFactory__01_deployProxyFactory", function () {
    it("01__01_01: it deploys the CommownSWProxyFactory and the CommownSW", async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        proxyFactory = await CommownSWProxyFactory.deploy();

        await proxyFactory.deployed();

		const logicAdrs = await proxyFactory.logic();
        expect(logicAdrs).to.be.not.undefined;
        expect(logicAdrs).to.be.not.null;
        expect(logicAdrs).to.be.not.NaN;
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
        bytesData = iface.encodeFunctionData("initialize", [addresses,confirmation,sign0.address]);
    });
    it("01__02-01: it deploys a proxy from sign0", async function () {
        proxyCreated = await proxyFactory.createProxy(addresses, confirmation, bytesData);
        receipt = await proxyCreated.wait();
    });
    it("01__02-02: it deploys a proxy from sign0 and emit en event", async function () {
        await expect(proxyFactory.createProxy(addresses, confirmation, bytesData)).to.emit(
            proxyFactory,
            "ProxyCreated"
        );
    });
    it("01__02-03: it deploys a proxy from sign1", async function () {
        await expect(
            proxyFactory.connect(sign1).createProxy(addresses, confirmation, bytesData)
        ).to.emit(proxyFactory, "ProxyCreated");
    });
	it("01__02-04: it reverts if nb of confirmation = 0 or nb of confirmation > nb of owners", async function () {
		bytesData = iface.encodeFunctionData("initialize", [addresses,0,sign0.address]);
		await expect(
			proxyFactory.createProxy(addresses, 0, bytesData)
        ).to.be.revertedWith(
            "invalid confirmation number"
        );
		bytesData = iface.encodeFunctionData("initialize", [addresses,4,sign0.address]);
		await expect(
			proxyFactory.createProxy(addresses, 4, bytesData)
        ).to.be.revertedWith(
            "invalid confirmation number"
        );
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

		bytesData = iface.encodeFunctionData("initialize", [addresses,confirmation,sign0.address]);
        proxyCreated = await proxyFactory.createProxy(addresses, confirmation, bytesData);
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
		bytesData = iface.encodeFunctionData("initialize", [addressesSign1,confirmationSign1,sign0.address]);

        let proxyCreatedSign1: ContractTransaction = await proxyFactory
            .connect(sign1)
            .createProxy(addressesSign1,confirmationSign1,bytesData);
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

describe("01_CommownSWProxyFactory__04_upgradeLogicAndProxies", function () {
	let proxyCreatedSign0: ContractTransaction;
	let proxyCreatedSign1: ContractTransaction;
	let proxyCreatedSign2: ContractTransaction;
    let receiptSign0: ContractReceipt;
	let receiptSign1: ContractReceipt;
	let receiptSign2: ContractReceipt;
    let proxyCreatedAddressSign0: string;
	let proxyCreatedAddressSign1: string;
	let proxyCreatedAddressSign2: string;
	let CSWContractSign0: Contract;
	let CSWContractSign1: Contract;
	let CSWContractSign2: Contract;

	beforeEach(async function () {
		//1 - deploy the proxy factory
		CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        proxyFactory = await CommownSWProxyFactory.deploy();
        await proxyFactory.deployed();

		CommownSW = await ethers.getContractFactory("CommownSW");

		//2 - deploy a proxy for each signer
        [sign0, sign1, sign2] = await ethers.getSigners();

		// 2.a for sign0
		bytesData = iface.encodeFunctionData("initialize", [addresses,confirmation,sign0.address]);
		proxyCreatedSign0 = await proxyFactory.createProxy(addresses, confirmation, bytesData);
        receiptSign0 = await proxyCreatedSign0.wait();
		proxyCreatedAddressSign0 = receiptSign0.events?.filter(
            (x) => {
                return x.event == "ProxyCreated";
            }
        )[0]?.args?.adrs;
		CSWContractSign0 = CommownSW.attach(proxyCreatedAddressSign0);
        
		// 2.b for sign1
		const addressesSign1 = [
            "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
            "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
        ];
        const confirmationSign1 = 1;
		bytesData = iface.encodeFunctionData("initialize", [addressesSign1,confirmationSign1,sign0.address]);
        proxyCreatedSign1 = await proxyFactory
            .connect(sign1)
            .createProxy(addressesSign1, confirmationSign1, bytesData);
        receiptSign1 = await proxyCreatedSign1.wait();
		proxyCreatedAddressSign1 = receiptSign1.events?.filter(
            (x) => {
                return x.event == "ProxyCreated";
            }
        )[0]?.args?.adrs;
		CSWContractSign1 = CommownSW.attach(proxyCreatedAddressSign1);
    });

    it("01__04_01: it updates the CSW logic contract and all proxies already deployed from the CSW proxy factory", async function () {
		const logicAdrs = await proxyFactory.logic();
        expect(logicAdrs).to.be.not.undefined;
        expect(logicAdrs).to.be.not.null;
        expect(logicAdrs).to.be.not.NaN;

		expect(await CSWContractSign0.owner()).to.be.equals(
            sign0.address
        );
		expect(await CSWContractSign1.owner()).to.be.equals(
            sign0.address
        );
		expect(await proxyFactory.owner()).to.be.equals(
            sign0.address
        );

		console.log("logicAdrs: ",logicAdrs);
		console.log("await CSWContractSign0.owner(): ",await CSWContractSign0.owner());
		console.log("await CSWContractSign1.owner(): ",await CSWContractSign1.owner());


		const CommownSWV2 = await ethers.getContractFactory("CommownSWV2");
		const proxyListToUpdate = [proxyCreatedAddressSign0,proxyCreatedAddressSign1];

		for(let i = 0; i< proxyListToUpdate.length; i++){
			const x = await upgrades.forceImport(proxyListToUpdate[i],CommownSW, {kind:'uups'});
			await x.deployed();
			
			const proxy = await upgrades.upgradeProxy(proxyListToUpdate[i], CommownSWV2);
			await proxy.deployed();
			/*console.log("CommownSW's Proxy deployed to: " + proxy.address);
			console.log(
				"CommownSW's Implementation (main contract) deployed to: ",
				await upgrades.erc1967.getImplementationAddress(proxy.address)
			);*/
		}
    });

	it("01__04_02: it updates the CSW logic address in the Factory contract and new users can use it to create new proxy (CSW)", async function () {
        const CommownSWV2 = await ethers.getContractFactory("CommownSWV2");
		
		//Simulate an update of a logic contract for already existing proxies
		const proxyListToUpdate = [proxyCreatedAddressSign0,proxyCreatedAddressSign1];
		let newLogicAdrs: string;
		for(let i = 0; i< proxyListToUpdate.length; i++){
			const x = await upgrades.forceImport(proxyListToUpdate[i],CommownSW, {kind:'uups'});
			await x.deployed();
			
			const proxy = await upgrades.upgradeProxy(proxyListToUpdate[i], CommownSWV2);
			await proxy.deployed();
			newLogicAdrs = await upgrades.erc1967.getImplementationAddress(proxy.address);
		}
		
		//Updates the logic address
		const defineNewLogicTx = await proxyFactory.defineNewLogic(newLogicAdrs);
        await defineNewLogicTx.wait();

		//Create a new proxy with that new logic address
		const addressesSign2 = [
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
			"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
			"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
        ];
        const confirmationSign2 = 3;
		bytesData = iface.encodeFunctionData("initialize", [addressesSign2,confirmationSign2,sign0.address]);
		proxyCreatedSign2 = await proxyFactory.createProxy(addressesSign2, confirmationSign2, bytesData);
        receiptSign2 = await proxyCreatedSign2.wait();
		proxyCreatedAddressSign2 = receiptSign2.events?.filter(
            (x) => {
                return x.event == "ProxyCreated";
            }
        )[0]?.args?.adrs;
		CSWContractSign2 = CommownSWV2.attach(proxyCreatedAddressSign2);
		
		//Controls
		expect(await proxyFactory.logic()).to.be.equals(newLogicAdrs);
		expect(await CSWContractSign2.VERSION()).to.be.equals("0.0.2");

    });

	it("01__04_03: After an update of a logic, a pre init contract can not call again initialize method", async function () {
        const CommownSWV2 = await ethers.getContractFactory("CommownSWV2");
		expect(await CSWContractSign0.VERSION()).to.be.equals("0.0.1");

		//Simulate an update of a logic contract for already existing proxies
		const proxyListToUpdate = [proxyCreatedAddressSign0,proxyCreatedAddressSign1];
		let newLogicAdrs: string;
		for(let i = 0; i< proxyListToUpdate.length; i++){
			const x = await upgrades.forceImport(proxyListToUpdate[i],CommownSW, {kind:'uups'});
			await x.deployed();
			
			const proxy = await upgrades.upgradeProxy(proxyListToUpdate[i], CommownSWV2);
			await proxy.deployed();
			newLogicAdrs = await upgrades.erc1967.getImplementationAddress(proxy.address);
		}
		
		//Updates the logic address
		const defineNewLogicTx = await proxyFactory.defineNewLogic(newLogicAdrs);
        await defineNewLogicTx.wait();

		//Controls
		expect(await CSWContractSign0.VERSION()).to.be.equals("0.0.2");
		await expect(
			CSWContractSign2.initialize(addresses, 2, sign0.address)
        ).to.be.revertedWith("Initializable: contract is already initialized");
		await expect(
			CSWContractSign2.initialize(addresses, 2, sign1.address)
        ).to.be.revertedWith("Initializable: contract is already initialized");
		await expect(
			CSWContractSign2.initialize(["0xbDA5747bFD65F08deb54cb465eB87D40e51B197E","0xdD2FD4581271e230360230F9337D5c0430Bf44C0"], 1, sign0.address)
        ).to.be.revertedWith("Initializable: contract is already initialized");
		
    });
});

