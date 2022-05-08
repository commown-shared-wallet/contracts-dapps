// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./CommownSW.sol";

contract CommownSWProxyFactory {
	event ProxyCreated(address indexed adrs);

	address public immutable logic;
	
	mapping(address => address[]) public commownProxiesPerUser;
	mapping(address => uint) public nbProxiesPerUser;
	address[] public proxiesList;

	constructor() {
		logic = address(new CommownSW());
	}
	
	function createProxy(address[] memory _owners, uint8 _confirmationNeeded) external returns (address) {
		ERC1967Proxy proxy = new ERC1967Proxy(
            logic,
            abi.encodeWithSelector(CommownSW(payable(address(0))).initialize.selector, _owners, _confirmationNeeded)
        );

		proxiesList.push(address(proxy));
		for(uint i;i<_owners.length; i++){
			commownProxiesPerUser[_owners[i]].push(address(proxy));
			nbProxiesPerUser[_owners[i]] += 1;
		}

		emit ProxyCreated(address(proxy));
		return address(proxy);
	}
}