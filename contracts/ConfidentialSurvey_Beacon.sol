// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/**
 * @title ConfidentialSurvey_Beacon
 * @dev Beacon contract yang mengelola implementasi ConfidentialSurvey
 * @notice Kontrak ini berfungsi sebagai registry untuk implementasi terbaru dari ConfidentialSurvey
 */
contract ConfidentialSurvey_Beacon is UpgradeableBeacon {
    /**
     * @dev Event yang dipancarkan ketika implementasi diupgrade
     * @param previousImplementation Alamat implementasi sebelumnya
     * @param newImplementation Alamat implementasi yang baru
     */
    event ImplementationUpgraded(
        address indexed previousImplementation,
        address indexed newImplementation
    );

    /**
     * @dev Constructor untuk menginisialisasi beacon dengan implementasi awal
     * @param _implementation Alamat kontrak implementasi ConfidentialSurvey
     * @param _owner Alamat yang akan menjadi owner dari beacon ini
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
     * @dev Mengupgrade implementasi ke versi yang baru
     * @param _newImplementation Alamat kontrak implementasi yang baru
     * @notice Hanya owner yang dapat melakukan upgrade
     * @notice Semua BeaconProxy yang menggunakan beacon ini akan otomatis menggunakan implementasi baru
     */
    function upgradeImplementation(
        address _newImplementation
    ) external onlyOwner {
        address oldImplementation = implementation();
        upgradeTo(_newImplementation);
        emit ImplementationUpgraded(oldImplementation, _newImplementation);
    }

    /**
     * @dev Mendapatkan alamat implementasi saat ini
     * @return Alamat kontrak implementasi yang sedang aktif
     */
    function getImplementation() external view returns (address) {
        return implementation();
    }
}
