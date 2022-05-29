// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

	enum PocketStatus {
		Voting,
        Signing,
        Executed
    }

	enum PocketType {
		token721,
		token1155,
		token20
	}