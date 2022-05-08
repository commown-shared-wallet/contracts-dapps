import { expect } from "chai";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
// import MyProxyFactory from "../src/artifacts/contracts/MyProxyFactory.sol/MyProxyFactory.json";
// import MyContract from "../src/artifacts/contracts/MyContract.sol/MyContract.json";


// describe('MyProxyFactory creationProxy', function () {

// 	it("deploys a proxy from sign0", async function(){	
// 		const addresses = ["0xbDA5747bFD65F08deb54cb465eB87D40e51B197E","0xdD2FD4581271e230360230F9337D5c0430Bf44C0","0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"];
// 		const confirmation = 2;
		
// 		const [sign0, sign1, sign2] = await ethers.getSigners();
// 		const MyProxyFactory = await ethers.getContractFactory("MyProxyFactory");
// 		const proxyFactory = await MyProxyFactory.deploy();

// 		await proxyFactory.deployed();

// 		const proxyCreated = await proxyFactory.createProxy(addresses,confirmation);
// 		console.log(proxyCreated); //Returns a transaction

// 		//If I continue like this, with the true proxy address, it works fine

// 		// const MyContract = await ethers.getContractFactory("MyContract");
// 		// const contract = await MyContract.attach("0x9f1ac54bef0dd2f6f3462ea0fa94fc62300d3a8e");
// 		// expect(await proxyContract.confirmationNeeded()).to.equal(2); //true
// 		// expect(await proxyContract.owners(1)).to.equal("0xdD2FD4581271e230360230F9337D5c0430Bf44C0"); //False and dont know why yet
// 	});
// });

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
		const proxyContract = new ethers.Contract(proxyAddress,MyContract.abi,sign0);
		
		/** 
		 * et ça
		 * c'est pareil, les deux fonctionnent, mais il faut récup en dur l'adresse du proxyCreated,
		 * le return semble ne pas fonctionner, car il ramène une transaction et pas l'adresse du contrat
			const MyContract = await ethers.getContractFactory("MyContract");
			const contract = await MyContract.attach("0x9f1ac54bef0dd2f6f3462ea0fa94fc62300d3a8e");
		*/

		/*console.log("Type ProxyContracy", typeof await proxyContract.owners(1));
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



