// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./CommownSW.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Commown Shared Wallet Proxy Factory
/// @author Aurélien ALBE - Younès MANJAL 😎
/// @notice Proxy factory contract for creation of a Commown Shared Wallet
/// @dev Proxy factory contract. State variables stored in the proxy. Logic will be in the Commown Shared Wallet contract.
contract CommownSWProxyFactory is Ownable {
    /// @notice Emitted when a proxy is created
    /// @dev Emitted when a proxy is created, can be use for front end purpose to get owners
    /// @param adrs Proxy's address created
    /// @param owners Owners of the proxy created
    event ProxyCreated(address indexed adrs, address[] owners);

    /// @dev Logic contract : address of the CommownSW.sol deployed
    address public immutable logic;

    /// @notice A user can have several CommownSW so several proxies
    /// @dev mapping of user => proxy address
    mapping(address => address[]) public commownProxiesPerUser;

    /// @notice A user can have several CommownSW so several proxies
    /// @dev mapping of user => number of proxy address
    mapping(address => uint256) public nbProxiesPerUser;

    /// @dev list of all proxies
    address[] public proxiesList;

    /// @notice constructor of the factory
    /// @dev constructor of the factory : has to change to un upgradable contract, or to permit the upgrade of the immutable logic main contract
    constructor() {
        logic = address(new CommownSW());
    }

    /// @notice function called from the front when you create a commown shared wallet
    /// @dev Function to call when you want to create a proxy for owners
    /// @param _owners list of the owners for the CSW
    /// @param _confirmationNeeded number of signature required for futures transaction in the CSW
    /// @return address of the proxy
    function createProxy(address[] memory _owners, uint8 _confirmationNeeded)
        external
        returns (address)
    {
		uint256 size = _owners.length;
		require(size <= 255 && size > 0, "_owners.length wrong");
        require(
            _confirmationNeeded > 0 && _confirmationNeeded <= size,
            "invalid confirmation number"
        );

        //Usage of the ERC1967Proxy
        //Initialisation of the proxy by calling the initialize function with selector
        ERC1967Proxy proxy = new ERC1967Proxy(
            logic,
            abi.encodeWithSelector(
                CommownSW(payable(address(0))).initialize.selector,
                _owners,
                _confirmationNeeded,
				owner()
            )
        );

        //Add the proxy to the global list
        proxiesList.push(address(proxy));

        //For each owner add the proxy and increment the proxy number by 1
        for (uint256 i; i < _owners.length; i++) {
            commownProxiesPerUser[_owners[i]].push(address(proxy));
            nbProxiesPerUser[_owners[i]] += 1;
        }

        //Emit the event
        emit ProxyCreated(address(proxy), _owners);
        return address(proxy);
    }
}
