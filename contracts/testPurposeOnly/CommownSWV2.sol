// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @title Commown Shared Wallet
/// @author Aurélien ALBE - Younès MANJAL 😎
/// @notice Main logic contract : Commown Shared Wallet
/** @dev Main logic contract : Commown Shared Wallet. That contract upgradeable follows the UUPS OZ standard and rules.
	- Initializable : that function is called while the proxy creation
	- UUPSUpgradeable : upgradeable pattern
	- OwnableUpgradeable : to use the Ownable function while being upgradeable
	- IERC721Receiver : to ensure that contract can hande safeTransferFrom ERC721
*/
contract CommownSWV2 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    IERC721Receiver
{
    /// @notice Emitted when a CommownSharedWallet is created
    /// @dev Emitted when a CSW is created, creator is indexed
    /// @param creator address of the creator
    /// @param owners addresses of the CSW owners
    /// @param confirmationNeeded number of signatures required
    event WalletCreated(
        address indexed creator,
        address[] owners,
        uint256 confirmationNeeded
    );

    /// @notice Emitted when deposit eth in the CSW
    /// @dev Emitted when deposit eth in the CSW, sender is indexed
    /// @param sender msg.sender emitting the deposit
    /// @param amount amount just deposited
    /// @param userBalance userBalance updated with deposit amount
    /// @param balance updated of the CSW
    event Deposit(
        address indexed sender,
        uint256 amount,
        uint256 userBalance,
        uint256 balance
    );

    /// @notice Emitted when withdrawing eth from the CSW
    /// @dev Emitted when withdrawing eth from the CSW, sender is indexed
    /// @param sender msg.sender emitting the withdrawal
    /// @param amount amount just withdrawed
    /// @param userBalance userBalance updated with withdraw amount
    /// @param balance updated of the CSW
    event Withdraw(
        address indexed sender,
        uint256 amount,
        uint256 userBalance,
        uint256 balance
    );

    /// @notice Emitted when creating a pocket for an investment purpose
    /// @dev Emitted when creating a pocket for an investment purpose, sender is indexed
    /// @param sender msg.sender emitting the proposal
    /// @param pocketID the ID of the pocket created
    /// @param to destination address for the futur transaction
    /// @param data of the futur transaction, that's the data which will be called on chain
    /// @param pStatus of the pocket created
    /// @param totalAmount to reach for that pocket before doing the transaction
    /// @param sharePerUser is the sharing of the futur investment. That is the sharing which will be used when taking profit and determine which amount is destinated to whom
    event ProposePocket(
        address indexed sender,
        uint256 pocketID,
        address to,
        bytes data,
        PocketStatus pStatus,
        uint256 totalAmount,
        uint256[] sharePerUser
    );

    //Constant can be inizialized even with Proxies
    string public constant VERSION = "0.0.2";

    /// @notice Owners list of the CommownSharedWallet
    /// @dev Only owners can transmit decision point though pockets or votes or via "transaction something"
    address[] public owners;

    /// @dev Utility mapping to check if an address is owner of that CSW
    mapping(address => bool) public isOwner;

    /// @notice Number of signatures from owners required to sign a transaction
    /// @dev As the number of wallet is limited to uint8, number of confirmationNeeded follows that type
    uint8 public confirmationNeeded;

    /// @notice Total of ethers already withdrawed
    /// @dev to keep ?
    uint256 public globalTotalWithdrawed;

    /// @notice Balance in Wei per User
    mapping(address => uint256) public balancePerUser;

    /// @notice Amount of withdrawed ethers per user
    /// @dev to keep ?
    mapping(address => uint256) public globalWithdrawPerUser;

    //Status of the pocket
    enum PocketStatus {
        Proposed,
		Voting,
        Signing,
        Executed
    }

    /// @notice This is the pocket representing an act of investment or selling. Eg : I want to buy an NFT
    /// @dev Pocket is the main struct representing an act of investment and evolve in function of the status PocketStatus
    struct Pocket {
        address to; //To whom the pocket will be buy
        bytes data; //Data on chain representing the transaction
        PocketStatus pStatus; //Status of the pocket
        uint256 totalAmount; //Total amount to reach
    }
    /// @dev pockets list, usefull to get the id
    Pocket[] public pockets;
	uint256 public pocketMaxID;


    /// @notice indicate if the owner x has signed the pocket ID y
    /// @dev mapping of poketID => commownSW owner => bool
    mapping(uint256 => mapping(address => bool)) public isSigned;

    /// @notice indicate the share per user for the pocket ID x.
    /// @dev mapping of poketID => commownSW owner => Share per user
    mapping(uint256 => mapping(address => uint256)) public sharePerUser;

    /// @notice indicate the NFT the owners willing to buy or bought
    /// @dev mapping of poketID => ERC721 address => ID of the NFT => Quantity (that last categories is for bundles of NFT)
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public items721;

    //mapping(uint256 => mapping(address => uint256)) items20; //poketID => ERC20 => amount
    //mapping(uint256 => mapping(address => mapping(uint256 => uint256))) items1155; //poketID => ERC1155 => ID => amount

    modifier isCommownOwner(address _sender) {
        require(isOwner[_sender], "not an owner");
        _;
    }

    modifier pocketExists(uint256 _pocketID) {
        require(_pocketID < pockets.length, "No such pocket exists");
        _;
    }

    modifier pocketNotExecuted(uint256 _pocketID) {
        require(
            pockets[_pocketID].pStatus != PocketStatus.Executed,
            "Pocket already executed"
        );
        _;
    }

    /** @dev : Initialize function is called by the proxy factory.
     * This is the "constructor" of the CS.
     * The "initializer" modifier guarantees that this function is only called once.
     * It calls the initialize of dependencies first, and then does the logic for the CSW.
     * Emit the WalletCreated event
     */
    /// @param _owners is the owners list of the CommownSharedWallet to create
    /// @param _confirmationNeeded is the number of signatures from owners required to sign a transaction
    function initialize(address[] memory _owners, uint8 _confirmationNeeded, address _admin)
        public
        initializer
    {
		uint256 size = _owners.length;
		require(size <= 255 && size > 0, "_owners.length wrong");
        require(
            _confirmationNeeded > 0 && _confirmationNeeded <= size,
            "invalid confirmation number"
        );

        __Ownable_init();
        __UUPSUpgradeable_init();
		transferOwnership(_admin);

        //For each owner...
        for (uint256 i; i < _owners.length; i++) {
            require(_owners[i] != address(0), "owner is address(0)"); //Not the 0 address
            require(!isOwner[_owners[i]], "owner is already listed"); //Not in double

            owners.push(_owners[i]); //Add to the list of owners
            isOwner[_owners[i]] = true; //Add in the helper mapping
        }

        confirmationNeeded = _confirmationNeeded;
        emit WalletCreated(msg.sender, _owners, _confirmationNeeded);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /// @dev To authorize the owner to upgrade the contract, it implements _authorizeUpgrade with the onlyOwner modifier. Better to use with the OZ plugins
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /// @dev to ensure the safe transfer from methods that our CSW can handle NFT and thus, they wont be stuck for ever
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /// @notice Payable function to deposit some ethers if you are a CommownSharedWallet owner.
    /// @dev A Commown owner can send ethers to that contract, it requires the amount is > 0 and updates the user balance
    receive() external payable isCommownOwner(msg.sender) {
        require(msg.value > 0, "value eq 0");
        balancePerUser[msg.sender] += msg.value;
        emit Deposit(
            msg.sender,
            msg.value,
            balancePerUser[msg.sender],
            address(this).balance
        );
    }

    /// @notice Withdraw ETH from the CommownSharedWallet. Has to be a CommownShareWallet owner.
    /** @dev Withdraw an _amount in wei from the CommownSharedWallet.
     * Has to be a CommownShareWallet owner. Reentrance guarded.
     * Requires the user's balance is > 0, the _amount is > 0 but less than the user's balance
     * Reentrancy pattern avoided :
     *	- Update of the balance before sending eth
     * 	- Test the success of the transaction and revert if the transaction failed
     */
    /// @param _amount of ETH to withdraw
    function withdraw(uint256 _amount) public isCommownOwner(msg.sender) {
        require(balancePerUser[msg.sender] > 0, "balance eq 0"); //Todo : virer ce require
        require(_amount > 0, "amount eq 0");
        require(_amount <= balancePerUser[msg.sender], "too big amount");

        balancePerUser[msg.sender] -= _amount; //Update the amount before the transaction is called to avoid reentrancy attack

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "transaction failed"); //Require the transactoin success or revert

        emit Withdraw(
            msg.sender,
            _amount,
            balancePerUser[msg.sender],
            address(this).balance
        ); //Emit the event
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

    /// @notice propose a pocket of investment for exemple to buy a NFT.
    /// @dev This is the main tool of that CSW. The address of the NFT contract, the NFT's ID and the amount to reach before buying are required
    /// @param _to address to which will be called once the amount of the pocket is reach and once the signatures are acquired
    /// @param _data data bytes which will be called once the amount of the pocket is reach and once the signatures are acquired
    /// @param _totalAmount uint256 amount to reach to process the futur transaction
    /// @param _users addresses of the owners. It is used in consort with the _sharePerUser to ensure the share for each user is well define
    /// @param _sharePerUser uint256 share per users of the pocket. That share property will be used to determine which amount is delivered to which address once a sell happens.
    /// @param _nftAdrs address of the NFT contract
    /// @param _nftId uint256 ID of the NFT
    /// @param _nftQtity uint256 quantity of the NFT
    function proposePocket(
        address _to,
        bytes memory _data,
        uint256 _totalAmount,
        address[] memory _users,
        uint256[] memory _sharePerUser,
        address _nftAdrs,
        uint256 _nftId,
        uint256 _nftQtity
    ) external isCommownOwner(msg.sender) {
        require(_users.length > 0, "owners required");
        require(_users.length == _sharePerUser.length, "length mismatch");

        pocketMaxID = pockets.length; //ID of the pocket
        pockets.push(Pocket(_to, _data, PocketStatus.Proposed, _totalAmount)); //Push the new pocket to the list

        //For each user
        for (uint8 i; i < _users.length; i++) {
            require(isOwner[_users[i]], "not an owner"); //Revert if not a user
            sharePerUser[pocketMaxID][_users[i]] = _sharePerUser[i]; //Define the share for that user
        }

        items721[pocketMaxID][_nftAdrs][_nftId] = _nftQtity; //Insert the NFT property which will be buy

        emit ProposePocket(
            msg.sender,
            pocketMaxID,
            _to,
            _data,
            PocketStatus.Proposed,
            _totalAmount,
            _sharePerUser
        ); //Emit the event
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
