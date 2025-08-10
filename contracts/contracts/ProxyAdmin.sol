// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ProxyAdmin as OpenZeppelinProxyAdmin} from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

// This contract is a simple wrapper around OpenZeppelin's ProxyAdmin
// to make it available for hardhat-deploy
contract ProxyAdmin is OpenZeppelinProxyAdmin {
    constructor(address initialOwner) OpenZeppelinProxyAdmin(initialOwner) {
        // All functionality is inherited from OpenZeppelin's ProxyAdmin
    }
}
