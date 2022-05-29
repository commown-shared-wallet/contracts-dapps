import { expect } from "chai";
import chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);

import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { CommownSWProxyFactoryInterface } from "../frontend/types/CommownSWProxyFactory";
import {
    Contract,
    ContractFactory,
    ContractTransaction,
    ContractReceipt,
    BigNumber,
    Transaction,
} from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Deferrable, parseEther } from "ethers/lib/utils";
import { Address } from "hardhat-deploy/types";
import internal = require("stream");

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

let bytesData: string;
let ABITest = ["function initialize(address[] memory _owners, uint8 _confirmationNeeded, address _admin)"];
let iface = new ethers.utils.Interface(ABITest);

describe("02_CommownSW__01_deployementAndInitializer", function () {
    beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
        expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1] = await ethers.getSigners();
		bytesData = iface.encodeFunctionData("initialize", [addresses1,confirmation,sign0.address]);
        proxyCreated = await CSWProxyFactoryContract.createProxy(bytesData);
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
    it("02__01-02: Owner(Admin) of CommownSW and CommownSWProxyFactory is sign0", async function () {
		expect(await CSWContract.owner()).to.be.equals(
            sign0.address
        );
		expect(await CSWProxyFactoryContract.owner()).to.be.equals(
            sign0.address
        );
	});
	it("02__01-03: it can transfer ownership", async function () {
		const tx = await CSWContract.transferOwnership("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199");
		await tx.wait();
		expect(await CSWContract.owner()).to.be.equals(
            "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
        );
	});
    it("02__01-04: it handles different state per proxy", async function () {
		bytesData = iface.encodeFunctionData("initialize", [addresses2,confirmation,sign0.address]);
        proxyCreated = await CSWProxyFactoryContract.createProxy(bytesData);
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

describe("02_CommownSW__02_ReceiveAndWithdrawETH", function () {
    let bn: BigNumber = parseEther("1.0");
    let tx: {};

    beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
        expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1, sign2, sign3] = await ethers.getSigners();

		bytesData = iface.encodeFunctionData("initialize", [addresses1,confirmation,sign0.address]);
        proxyCreated = await CSWProxyFactoryContract.createProxy(bytesData);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

        expect(proxyCreatedAddress).to.be.not.undefined;

        CommownSW = await ethers.getContractFactory("CommownSW");
        CSWContract = CommownSW.attach(proxyCreatedAddress);

        tx = {
            to: CSWContract.address,
            value: bn,
        };
    });
    it("02__02-01: it receives ETH for a CSW owner, updates his balance and updates the global balance", async function () {
        const receiptTx = await sign0.sendTransaction(tx);
        await receiptTx.wait();

        const balanceOfSign0 = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfSign0).to.be.equal(bn);
    });
    it("02__02-02: it does not receive ETH for a non CSW owner, or 0 wei sent, balances remain unchange", async function () {
        //isCommownOwner
        await expect(sign3.sendTransaction(tx)).to.be.revertedWith(
            "not an owner"
        );

        //msg.value=0
        let tx2 = {
            to: CSWContract.address,
            value: parseEther("0"),
        };
        await expect(sign0.sendTransaction(tx2)).to.be.revertedWith(
            "value eq 0"
        );
    });
    it("02__02-03: it emits an event when receiving ETH", async function () {
        await expect(await sign0.sendTransaction(tx))
            .to.emit(CSWContract, "Deposit")
            .withArgs(sign0.address, bn, bn, bn);

        const balanceOfSign0 = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfSign0).to.be.equal(bn);
    });
    it("02__02-04: it withdraw ETH for a CSW owner and update balances", async function () {
        const receiptTx = await sign0.sendTransaction(tx);
        await receiptTx.wait();

        let balanceOfSign0 = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfSign0).to.be.equal(bn);

        const withdrawTx = await CSWContract.withdraw(bn);
        await withdrawTx.wait();

        balanceOfSign0 = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfSign0).to.be.equal(0);
    });
    it("02__02-05: it does not withdraw ETH for a non CSW owner, or 0 wei asked, balances remain unchanged", async function () {
        const receiptTx = await sign0.sendTransaction(tx);
        await receiptTx.wait();

        let balanceOfSign0 = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfSign0).to.be.equal(bn);

        //isCommownOwner
        await expect(
            CSWContract.connect(sign3).withdraw(bn)
        ).to.be.revertedWith("not an owner");

        //_amount=0
        await expect(CSWContract.withdraw(0)).to.be.revertedWith("amount eq 0");

        //_amount>balance of sign0
        await expect(
            CSWContract.withdraw(parseEther("2.0"))
        ).to.be.revertedWith("too big amount");

        balanceOfSign0 = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfSign0).to.be.equal(bn);
    });
    it("02__02-06: it emits an event when withdrawing ETH", async function () {
        const receiptTx = await sign0.sendTransaction(tx);
        await receiptTx.wait();
        await expect(await CSWContract.withdraw(bn))
            .to.emit(CSWContract, "Withdraw")
            .withArgs(sign0.address, bn, 0, 0);
    });
    it("02__02-07: it handles different deposit of different users and withdraw dont affect others", async function () {
        let txAlice = {
            to: CSWContract.address,
            value: parseEther("4.0"),
        };
        let alicePrevBalance = await sign0.getBalance();
        const receiptTxAlice = await sign0.sendTransaction(txAlice);
        await receiptTxAlice.wait();

        let txBob = {
            to: CSWContract.address,
            value: parseEther("6.0"),
        };
        let bobPrevBalance = await sign1.getBalance();
        const receiptTxBob = await sign1.sendTransaction(txBob);
        await receiptTxBob.wait();

        let balanceOfCSWofAlice = await CSWContract.balancePerUser(
            sign0.address
        );
        expect(balanceOfCSWofAlice).to.be.equal(parseEther("4.0"));
        let aliceNewBalance = await sign0.getBalance();
        expect(aliceNewBalance).to.be.lt(alicePrevBalance);

        let balanceOfCSWofBob = await CSWContract.balancePerUser(sign1.address);
        expect(balanceOfCSWofBob).to.be.equal(parseEther("6.0"));
        let bobNewBalance = await sign1.getBalance();
        expect(bobNewBalance).to.be.lt(bobPrevBalance);

        const aliceWithdrawTx = await CSWContract.withdraw(parseEther("2.0"));
        await aliceWithdrawTx.wait();

        balanceOfCSWofAlice = await CSWContract.balancePerUser(sign0.address);
        expect(balanceOfCSWofAlice).to.be.equal(parseEther("2.0"));
        expect(balanceOfCSWofBob).to.be.equal(parseEther("6.0"));
    });
});

describe("02_CommownSW__03_createPocket", function () {
    let addressTo: string;
    let bytesData: string;
    let totalAmount: number;
    let nftAdrs: string;
    let nftId: number;
    let nftQtity: number;
	
	let item: string;
	let pStatus: number;
	let pType: number;
	let _totalAmount: number;
	let id: number;
	let qty: number;
	let addresses1AndShares1: (string | number)[][];
    beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
        expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1, sign2, sign3] = await ethers.getSigners();

        bytesData = iface.encodeFunctionData("initialize", [addresses1,confirmation,sign0.address]);
        proxyCreated = await CSWProxyFactoryContract.createProxy(bytesData);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

        expect(proxyCreatedAddress).to.be.not.undefined;

        CommownSW = await ethers.getContractFactory("CommownSW");
        CSWContract = CommownSW.attach(proxyCreatedAddress);

        addressTo = "0xd9145CCE52D386f254917e481eB44e9943F39138";
        totalAmount = 100;
        let ABITestTmp = ["function callMe(uint x) "];
        let ifaceEth = new ethers.utils.Interface(ABITestTmp);
        bytesData = ifaceEth.encodeFunctionData("callMe", [2]);
        //0xe73620c30000000000000000000000000000000000000000000000000000000000000002
        //parseEther("1.0")
        nftAdrs = "0xd9145CCE52D386f254917e481eB44e9943F39138";
        nftId = 1;
        nftQtity = 1;
		
		addresses1AndShares1 = [
			["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",25],
			["0x70997970C51812dc3A010C7d01b50e0d17dc79C8",50],
			["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",25]
		];

    });
    it("02__03-01: it proposes a Pocket which can be retrieve from array", async function () {
        const proposePocketTx = await CSWContract.proposePocket(
            addressTo,
            bytesData,
            totalAmount,
            addresses1AndShares1,
            nftAdrs,
            nftId,
			nftQtity,
			0
        );
        await proposePocketTx.wait();

        //const pocket0 = await CSWContract.pockets(0);
		//console.log(pocket0);
		[item, pStatus, pType, _totalAmount, id, qty] = await CSWContract.getPocketLight(0);
        expect(item).to.be.equal(nftAdrs);
		expect(pStatus).to.be.equal(0);
		expect(pType).to.be.equal(0);
		expect(_totalAmount).to.be.equal(totalAmount);
		expect(id).to.be.equal(nftId);
		expect(qty).to.be.equal(nftQtity);
        
    });
    it("02__03-02: it proposes a Pocket which can be retrieve from emitted event", async function () {
        const proposePocketTx = await CSWContract.proposePocket(
            addressTo,
            bytesData,
            totalAmount,
            addresses1AndShares1,
            nftAdrs,
            nftId,
			nftQtity,
			0
        );
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
            CSWContract.connect(sign3).proposePocket(
                addressTo,
                bytesData,
                totalAmount,
                addresses1AndShares1,
                nftAdrs,
                nftId,
				nftQtity,
				0
            )
        ).to.be.revertedWith("not an owner");

        //_users.length
        await expect(
            CSWContract.proposePocket(
                addressTo,
                bytesData,
                totalAmount,
                [],
                nftAdrs,
                nftId,
				nftQtity,
				0
            )
        ).to.be.revertedWith("0-255 shares required");

        //isOwner[_users[i]]
        await expect(
            CSWContract.proposePocket(
                addressTo,
                bytesData,
                totalAmount,
                [["0xd9145CCE52D386f254917e481eB44e9943F39138",25]],
                nftAdrs,
                nftId,
				nftQtity,
				0
            )
        ).to.be.revertedWith("not an owner");
    });
	it("02__03-04: creator counts for one vote", async function () {
		const proposePocketTx = await CSWContract.proposePocket(
            addressTo,
            bytesData,
            totalAmount,
            addresses1AndShares1,
            nftAdrs,
            nftId,
			nftQtity,
			0
        );
        await proposePocketTx.wait();
		
		expect(addresses1[0]).to.be.equals(sign0.address);
		expect(await CSWContract.isSigned(0,addresses1[0])).to.be.true;
		expect(await CSWContract.isSigned(0,addresses1[1])).to.be.false;
		expect(await CSWContract.isSigned(0,sign0.address)).to.be.true;
		expect(await CSWContract.isSigned(0,sign1.address)).to.be.false;
		//console.log(await CSWContract.getOwnerOfPocket(0));
	});
	it("02__03-05: it saves the share per user correctly", async function () {
        const proposePocketTx = await CSWContract.proposePocket(
            addressTo,
            bytesData,
            totalAmount,
            addresses1AndShares1,
            nftAdrs,
            nftId,
			nftQtity,
			0
        );
        await proposePocketTx.wait();
		
        expect(await CSWContract.sharePerUser(0,sign0.address)).to.be.equal(25);
		expect(await CSWContract.sharePerUser(0,sign1.address)).to.be.equal(50);
		expect(await CSWContract.sharePerUser(0,sign2.address)).to.be.equal(25);
    });
	it("02__03-06: it votes", async function(){
		await expect(
			CSWContract.voteForPocket(1)
		).to.be.revertedWith("No such pocket exists");

		const proposePocketTx = await CSWContract.proposePocket(
            addressTo,
            bytesData,
            totalAmount,
            addresses1AndShares1,
            nftAdrs,
            nftId,
			nftQtity,
			0
        );
        await proposePocketTx.wait();

		await expect(
			CSWContract.voteForPocket(1)
		).to.be.revertedWith("No such pocket exists");

	});
});


describe("02_CommownSW__04_votePocket", function () {
    let addressTo: string;
    let bytesData: string;
    let totalAmount: number;
    let nftAdrs: string;
    let nftId: number;
    let nftQtity: number;
	let addresses1AndShares1: (string | number)[][];
	beforeEach(async function () {
        CommownSWProxyFactory = await ethers.getContractFactory(
            "CommownSWProxyFactory"
        );
        CSWProxyFactoryContract = await CommownSWProxyFactory.deploy();
        await CSWProxyFactoryContract.deployed();
        expect(await CSWProxyFactoryContract.logic()).to.be.not.undefined;

        [sign0, sign1, sign2, sign3] = await ethers.getSigners();

        bytesData = iface.encodeFunctionData("initialize", [addresses1,confirmation,sign0.address]);
        proxyCreated = await CSWProxyFactoryContract.createProxy(bytesData);
        receipt = await proxyCreated.wait();
        proxyCreatedAddress = receipt.events?.filter((x) => {
            return x.event == "ProxyCreated";
        })[0]?.args?.adrs;

        expect(proxyCreatedAddress).to.be.not.undefined;

        CommownSW = await ethers.getContractFactory("CommownSW");
        CSWContract = CommownSW.attach(proxyCreatedAddress);

        addressTo = "0xd9145CCE52D386f254917e481eB44e9943F39138";
        totalAmount = 100;
        let ABITestTmp = ["function callMe(uint x) "];
        let ifaceEth = new ethers.utils.Interface(ABITestTmp);
        bytesData = ifaceEth.encodeFunctionData("callMe", [2]);
        
		addresses1AndShares1 = [
			["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",25],
			["0x70997970C51812dc3A010C7d01b50e0d17dc79C8",50],
			["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",25]
		];
        nftAdrs = "0xd9145CCE52D386f254917e481eB44e9943F39138";
        nftId = 1;
        nftQtity = 1;
		
		const proposePocketTx = await CSWContract.proposePocket(
            addressTo,
            bytesData,
            totalAmount,
            addresses1AndShares1,
            nftAdrs,
            nftId,
			nftQtity,
			0
        );
        await proposePocketTx.wait();
    });
	it("02__04-01: it can vote for a Pocket, increments number of vote, isSigned becomes true", async function () {
		expect(await CSWContract.numConfirmations(0)).to.be.equal(1);
		expect(await CSWContract.isSigned(0,sign0.address)).to.be.true;

		const voteTx = await CSWContract.connect(sign1).voteForPocket(0);
		await voteTx.wait();

		expect(await CSWContract.numConfirmations(0)).to.be.equal(2);
		expect(await CSWContract.isSigned(0,sign1.address)).to.be.true;
		expect(await CSWContract.isSigned(0,sign2.address)).to.be.false;
		
    });
    it("02__04-02: it reverts if not an owner", async function () {
        await expect(
            CSWContract.connect(sign3).voteForPocket(0)
        ).to.be.revertedWith("not an owner");
	});
	it("02__04-03: it reverts if not an existing pocket", async function(){
		await expect(
			CSWContract.voteForPocket(1)
		).to.be.revertedWith("No such pocket exists");
	});
	it("02__04-04: it reverts if pocket already signed", async function () {
		await expect(
			CSWContract.voteForPocket(0)
		).to.be.revertedWith("already signed");
	});
	it("02__04-05: it reverts if not at the good stage", async function(){

	});

	/*it("02__04-05: it reverts if not a share holder of the commown owner", async function () {
        //notAnyShare
        await expect(
            CSWContract.proposePocket(
                addressTo,
                bytesData,
                totalAmount,
                ["0xd9145CCE52D386f254917e481eB44e9943F39138"],
                [25],
                nftAdrs,
                nftId
            )
        ).to.be.revertedWith("not an owner");
    });*/
});