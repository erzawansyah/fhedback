// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/**
 * @title ConfidentialSurvey_Beacon
 * @dev Beacon contract that manages the implementation of ConfidentialSurvey
 * @notice This contract serves as a registry for the latest implementation of ConfidentialSurvey
 */
contract ConfidentialSurvey_Beacon is UpgradeableBeacon {
    /**
     * @dev Event emitted when the implementation is upgraded
     * @param previousImplementation Address of the previous implementation
     * @param newImplementation Address of the new implementation
     */
    event ImplementationUpgraded(
        address indexed previousImplementation,
        address indexed newImplementation
    );

    /**
     * @dev Constructor to initialize the beacon with the initial implementation
     * @param _implementation Address of the ConfidentialSurvey implementation contract
     * @param _owner Address that will be the owner of this beacon
     */
    constructor(
        address _implementation,
        address _owner
    ) UpgradeableBeacon(_implementation, _owner) {
        require(
            _implementation != address(0),
            "Implementation cannot be zero address"
        );
    }

    /**
     * @dev Upgrade the implementation to a new version
     * @param _newImplementation Address of the new implementation contract
     * @notice Only the owner can perform the upgrade
     * @notice All BeaconProxy contracts using this beacon will automatically use the new implementation
     */
    function upgradeImplementation(
        address _newImplementation
    ) external onlyOwner {
        address oldImplementation = implementation();
        upgradeTo(_newImplementation);
        emit ImplementationUpgraded(oldImplementation, _newImplementation);
    }

    /**
     * @dev Get the current implementation address
     * @return Address of the currently active implementation contract
     */
    function getImplementation() external view returns (address) {
        return implementation();
    }
}
