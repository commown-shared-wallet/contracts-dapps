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
        //console.log(receipt.events?.filter((x) => {return x.event == "ProxyCreated"}));
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

describe("01_CommownSWProxyFactory__03_proxiesListAndMapping", function () {
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
