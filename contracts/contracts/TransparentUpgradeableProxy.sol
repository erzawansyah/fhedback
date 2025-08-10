// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TransparentUpgradeableProxy as OpenZeppelinTransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

// This contract is a simple wrapper around OpenZeppelin's TransparentUpgradeableProxy
// to make it available for hardhat-deploy
contract TransparentUpgradeableProxy is
    OpenZeppelinTransparentUpgradeableProxy
{
    constructor(
        address _logic,
        address admin_,
        bytes memory _data
    ) OpenZeppelinTransparentUpgradeableProxy(_logic, admin_, _data) {
        // All functionality is inherited from OpenZeppelin's TransparentUpgradeableProxy
    }
}
