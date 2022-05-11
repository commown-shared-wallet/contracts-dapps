// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @title Commown Shared Wallet
/// @author Aurélien ALBE - Younès MANGAL 😎
/// @notice Main logic contract : Commown Shared Wallet
/// @dev Main logic contract : Commown Shared Wallet. That contract upgradeable follows the UUPS OZ standard and rules.
/// @dev Initializable : that function is called while the proxy creation
/// @dev UUPSUpgradeable : upgradeable pattern
/// @dev OwnableUpgradeable : to use the Ownable function while being upgradeable
/// @dev IERC721Receiver : to ensure that contract can hande safeTransferFrom ERC721
contract CommownSW is Initializable, UUPSUpgradeable, OwnableUpgradeable, IERC721Receiver  {

	/// @notice Emitted when a CommownSharedWallet is created
	/// @dev Emitted when a CSW is created, creator is indexed
	/// @param creator address of the creator
	/// @param owners addresses of the CSW owners
	/// @param confirmationNeeded number of signatures required
	event WalletCreated(address indexed creator, address[] owners, uint256 confirmationNeeded);

	/// @notice Emitted when deposit eth in the CSW
	/// @dev Emitted when deposit eth in the CSW, sender is indexed
	/// @param sender msg.sender emitting the deposit
	/// @param amount amount just deposited
	/// @param userBalance userBalance updated with deposit amount
	/// @param balance updated of the CSW
	event Deposit(address indexed sender, uint256 amount, uint256 userBalance, uint256 balance);
	
	/// @notice Emitted when withdrawing eth from the CSW
	/// @dev Emitted when withdrawing eth from the CSW, sender is indexed
	/// @param sender msg.sender emitting the withdrawal
	/// @param amount amount just withdrawed
	/// @param userBalance userBalance updated with withdraw amount
	/// @param balance updated of the CSW
	event Withdraw(address indexed sender, uint256 amount, uint256 userBalance, uint256 balance);
	
	/// @notice Emitted when creating a pocket for an investment purpose
	/// @dev Emitted when creating a pocket for an investment purpose, sender is indexed
	/// @param sender msg.sender emitting the proposal
	/// @param pocketID the ID of the pocket created
	/// @param to destination address for the futur transaction
	/// @param data of the futur transaction, that's the data which will be called on chain
	/// @param pStatus of the pocket created
	/// @param totalAmount to reach for that pocket before doing the transaction
	/// @param sharePerUser is the sharing of the futur investment. That is the sharing which will be used when taking profit and determine which amount is destinated to whom
	event ProposePocket(address indexed sender, uint256 pocketID, address to, bytes data, PocketStatus pStatus, uint256 totalAmount, uint[] sharePerUser);

    //Constant can be inizialized even with Proxies
    string public constant VERSION = "0.0.1";
 
	//Status of the pocket
	enum PocketStatus {
		Proposed,
		Signing,
		Executed
	}


	struct Pocket {
		address to; //To whom the pocket will be buy
		bytes data; //Data on chain representing the transaction
		PocketStatus pStatus; //Status of the pocket
		uint256 totalAmount; //Total amount to reach
    }
	Pocket[] public pockets;
	mapping(uint256 => mapping(address => bool)) public isSigned; //poketID => commownSW owner => bool
    mapping(uint256 => mapping(address => uint256)) public sharePerUser; //poketID => commownSW owner => Share per user
	mapping(uint256 => mapping(address => mapping (uint256 => uint256))) public items721; //poketID => ERC721 => ID => Quantity
	//mapping(uint256 => mapping(address => uint256)) items20; //poketID => ERC20 => amount
    //mapping(uint256 => mapping(address => mapping(uint256 => uint256))) items1155; //poketID => ERC1155 => ID => amount   
	

	//Component of a CommownWallet : List of owners of the contract, only those can call some of the functions
	address[] public owners; 
	mapping(address => bool) public isOwner;
	uint8 public confirmationNeeded;


	//Global Balance
	uint256 public globalTotalWithdrawed; //Total of ethers already withdrawed
	mapping(address => uint256) public balancePerUser; //Balance in Wei per User
	mapping(address => uint256) public globalWithdrawPerUser; //Amount of withdrawed ethers per user




	modifier isCommownOwner(address _sender){
		require(isOwner[_sender],"not an owner");
		_;
	}

	modifier pocketExists(uint _pocketID) {
		require(_pocketID < pockets.length, "No such pocket exists");
		_;
	}

	modifier pocketNotExecuted(uint _pocketID) {
		require(pockets[_pocketID].pStatus != PocketStatus.Executed, "Pocket already executed");
		_;
	}

	
    /// @dev : function initialize
    function initialize(address[] memory _owners, uint8 _confirmationNeeded) public initializer {
		require(_owners.length > 0, "owners required");
		require(_confirmationNeeded > 0 && _confirmationNeeded<= _owners.length, "confirmation number invalid");
		
		__Ownable_init();
        __UUPSUpgradeable_init();

		for(uint i;i<_owners.length; i++){
			require(_owners[i] != address(0),"owner is address(0)");
			require(!isOwner[_owners[i]],"owner is already listed");

			owners.push(_owners[i]);
			isOwner[_owners[i]] = true;
		}

		confirmationNeeded = _confirmationNeeded;
		emit WalletCreated(msg.sender,_owners,_confirmationNeeded);
	}

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
    	return this.onERC721Received.selector;
    }

	//Owners can send ethers, a contract, a sell can send ethers...
	receive() external payable isCommownOwner(msg.sender) {
		require(msg.value>0,"value eq 0");
		balancePerUser[msg.sender] += msg.value;
		emit Deposit(msg.sender, msg.value, balancePerUser[msg.sender], address(this).balance);
	}

	/// @notice Withdraw ETH from the CommownSharedWallet. Has to be a CommownShareWallet owner.
	/// @dev Withdraw an _amount in wei from the CommownSharedWallet. Has to be a CommownShareWallet owner. 
	/// @param _amount of ETH to withdraw
	function withdraw(uint256 _amount) public isCommownOwner(msg.sender){
		require(balancePerUser[msg.sender]>0,"balance eq 0");
		require(_amount>0,"amount eq 0");
		require(_amount<=balancePerUser[msg.sender],"too big amount");

		balancePerUser[msg.sender] -= _amount;
		
		(bool success,) = payable(msg.sender).call{value:_amount}("");
		require(success,"transaction failed");
		
		emit Withdraw(msg.sender, _amount, balancePerUser[msg.sender], address(this).balance);
	}

	// signPocket
	// fundPocket
	// revokeFundPocket
	// revokeSignPocket
	// executePocket == buy
	// sellPocket
	// withdrawPocket
	// withDrawGlobal
	// allMethodForERC721

	
	function proposePocket(address _to, bytes memory _data, uint256 _totalAmount, address[] memory _users, uint256[] memory _sharePerUser, address _nftAdrs, uint256 _nftId, uint256 _nftQtity) external isCommownOwner(msg.sender){
		require(_users.length > 0, "owners required");
		require(_users.length == _sharePerUser.length, "length mismatch");
				
		uint256 _pocketID = pockets.length;
        pockets.push(Pocket(_to,_data,PocketStatus.Proposed,_totalAmount));
        
		for(uint8 i;i<_users.length;i++){
			require(isOwner[_users[i]],"not an owner");
			sharePerUser[_pocketID][_users[i]]=_sharePerUser[i];
		}
		
		items721[_pocketID][_nftAdrs][_nftId]=_nftQtity;

		emit ProposePocket(msg.sender, _pocketID, _to, _data, PocketStatus.Proposed, _totalAmount, _sharePerUser);
	}


	//Callable after a pocketSell
	// function withdrawPocket(uint256 _pocketID, uint256 _sellPrice) private pocketExists(_pocketID) {
	// 	//Alice 40
	// 	//Bob 60
	// 	//10 eth => 100 eth
	// 	// A 40/(40+60) * sell amount et B 60/(40+60)
	// 	uint256 totalWithdrawed;
	// 	uint256 toPay;
	// 	for(uint i;i<)
	// 		toPay = (totalWithdrawed + totalsharePerUser[_pocketID][msg.sender])

	// 	uint256 toPay = ((address(this).balance + totalAlreadyWithdrawed) * sharePerUser[msg.sender]) / totalShares - withdrawPerUser[msg.sender];
	// 	require(toPay>0,"Nothing to pay");

	// 	totalAlreadyWithdrawed += toPay;
	// 	withdrawPerUser[msg.sender] += toPay;
	// }


	
}