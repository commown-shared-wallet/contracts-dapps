// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract CommownSW is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    IERC721Receiver
{
    //IER1155
    //IERC721
    //ERC1155Receiver
    //ERC721Receiver

    event WalletCreated(
        address indexed creator,
        address[] owners,
        uint256 confirmationNeeded
    );
    event Deposit(
        address indexed sender,
        uint256 amount,
        uint256 userBalance,
        uint256 balance
    );
    event Withdraw(
        address indexed sender,
        uint256 amount,
        uint256 userBalance,
        uint256 balance
    );
    event ProposePocket(
        address indexed sender,
        uint256 pocketID,
        address to,
        bytes data,
        PocketStatus,
        uint256 totalAmount,
        uint256[] sharePerUser
    );

    //Constant can be inizialized even with Proxies
    string public constant VERSION = "0.0.1";

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
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        public items721; //poketID => ERC721 => ID => Quantity
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

    /// @dev : function initialize
    function initialize(address[] memory _owners, uint8 _confirmationNeeded)
        public
        initializer
    {
        require(_owners.length > 0, "owners required");
        require(
            _confirmationNeeded > 0 && _confirmationNeeded <= _owners.length,
            "confirmation number invalid"
        );

        __Ownable_init();
        __UUPSUpgradeable_init();

        for (uint256 i; i < _owners.length; i++) {
            require(_owners[i] != address(0), "owner is address(0)");
            require(!isOwner[_owners[i]], "owner is already listed");

            owners.push(_owners[i]);
            isOwner[_owners[i]] = true;
        }

        confirmationNeeded = _confirmationNeeded;
        emit WalletCreated(msg.sender, _owners, _confirmationNeeded);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    //Owners can send ethers, a contract, a sell can send ethers...
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
    /// @dev Withdraw an _amount in wei from the CommownSharedWallet. Has to be a CommownShareWallet owner.
    /// @param _amount of ETH to withdraw
    function withdraw(uint256 _amount) public isCommownOwner(msg.sender) {
        require(balancePerUser[msg.sender] > 0, "balance eq 0");
        require(_amount > 0, "amount eq 0");
        require(_amount <= balancePerUser[msg.sender], "too big amount");

        balancePerUser[msg.sender] -= _amount;

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "transaction failed");

        emit Withdraw(
            msg.sender,
            _amount,
            balancePerUser[msg.sender],
            address(this).balance
        );
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

    function proposePocket(
        address _to,
        bytes memory _data,
        uint256 _totalAmount,
        address[] memory _users,
        uint256[] memory _sharePerUser
    ) external isCommownOwner(msg.sender) {
        require(_users.length > 0, "owners required");
        require(_users.length == _sharePerUser.length, "length mismatch");

        uint256 _pocketID = pockets.length;
        pockets.push(Pocket(_to, _data, PocketStatus.Proposed, _totalAmount));

        for (uint8 i; i < _users.length; i++) {
            require(isOwner[_users[i]], "not an owner");
            sharePerUser[_pocketID][_users[i]] = _sharePerUser[i];
        }

        emit ProposePocket(
            msg.sender,
            _pocketID,
            _to,
            _data,
            PocketStatus.Proposed,
            _totalAmount,
            _sharePerUser
        );
    }

    //Callable after a pocketSell
    // function withdrawPocket(uint256 _pocketID, uint256 _sellPrice) private {

    // 	//100 - 100*60/100 = 100 - 60 = 40
    // 	//HEREEEEEEEEEEEEEEEEEEEEEE
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
