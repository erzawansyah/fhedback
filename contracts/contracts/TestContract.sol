// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract TestContract is SepoliaConfig {
    // Example function to demonstrate FHE ACL usage

    euint8 private sensitiveData;
    euint8[] private sensitiveArray;
    euint64 private sensitiveData64;

    function setSensitiveData(
        externalEuint8 _data,
        bytes memory _proof
    ) external {
        sensitiveData = FHE.fromExternal(_data, _proof);
        FHE.allowThis(sensitiveData); // Allow contract to read this value
        FHE.allow(sensitiveData, msg.sender); // Allow sender to read this value
    }

    function setSensitiveArray(
        externalEuint8[] calldata _data,
        bytes memory _proof
    ) external {
        for (uint256 i = 0; i < _data.length; i++) {
            euint8 value = FHE.fromExternal(_data[i], _proof);
            FHE.allowThis(value); // Allow contract to read each value
            FHE.allow(value, msg.sender); // Allow sender to read each value
            sensitiveArray.push(value);
        }
    }

    function incrementSensitiveData(
        externalEuint8[] calldata _newValue,
        bytes memory _proof
    ) external {
        for (uint256 i = 0; i < _newValue.length; i++) {
            euint8 newValue = FHE.fromExternal(_newValue[i], _proof);
            sensitiveData = FHE.add(sensitiveData, newValue);
            FHE.allowThis(sensitiveData); // Allow contract to read updated value
        }
        FHE.allow(sensitiveData, msg.sender); // Allow sender to read the updated value
    }

    function getSensitiveData() external view returns (euint8) {
        return sensitiveData;
    }

    function getSensitiveArray(uint256 index) external view returns (euint8) {
        require(index < sensitiveArray.length, "Index out of bounds");
        return sensitiveArray[index];
    }

    function getSensitiveData64() external view returns (euint64) {
        return sensitiveData64;
    }

    function setSensitiveData64From8(
        externalEuint8[] memory _data,
        bytes memory _proof
    ) external {
        require(_data.length == 8, "Input must be 8 elements");
        for (uint256 i = 0; i < _data.length; i++) {
            euint8 value = FHE.fromExternal(_data[i], _proof);
            euint64 value64 = FHE.asEuint64(value);
            sensitiveData64 = FHE.add(sensitiveData64, value64);
            FHE.allowThis(sensitiveData64); // Allow contract to read updated value
        }
        FHE.allow(sensitiveData64, msg.sender); // Allow sender to read the updated value
    }
}
