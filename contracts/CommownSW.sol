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
    event Deposit(address indexed sender, uint256 amount, uint256 balance);

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
        uint256 nbSign; //nb of sign of the pocket
        uint256 currentAmount; //Current amount
        uint256 totalAmount; //Total amount to reach
        uint256 totalWithdrawed; //Total amount already withdrawed
        mapping(address => uint256) amountPerUser; //Share per user
        mapping(address => uint256) withdrawPerUser; //Amount of withdrawed ethers per user
        mapping(address => uint256) items20; //ERC20 => amount
        mapping(address => mapping(uint256 => uint256)) items721; //ERC721 => ID => quantity
        mapping(address => mapping(uint256 => uint256)) items1155; //ERC1155 => ID => amount
    }
    Pocket[] public pockets;
    mapping(uint256 => mapping(address => bool)) public isSigned; //poketID => commownSW owner => bool

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
        balancePerUser[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
}
