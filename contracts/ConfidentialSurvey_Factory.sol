// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ConfidentialSurvey_Beacon.sol";

/**
 * @title ConfidentialSurvey_Factory
 * @dev Factory contract untuk membuat instance ConfidentialSurvey menggunakan BeaconProxy pattern
 * @notice Kontrak ini memungkinkan pembuatan survey yang dapat diupgrade melalui beacon
 */
contract ConfidentialSurvey_Factory is Ownable, ReentrancyGuard {
    /// @dev Address dari beacon contract
    ConfidentialSurvey_Beacon public immutable beacon;

    /// @dev Counter untuk total survey yang telah dibuat
    uint256 public totalSurveys;

    /// @dev Mapping dari survey ID ke alamat proxy contract
    mapping(uint256 => address) public surveys;

    /// @dev Mapping dari alamat owner ke array survey ID yang dimiliki
    mapping(address => uint256[]) public ownerSurveys;

    /// @dev Mapping dari alamat proxy ke survey ID
    mapping(address => uint256) public surveyIds;

    /// @dev Array semua alamat survey untuk enumerasi
    address[] public allSurveys;

    /**
     * @dev Event yang dipancarkan ketika survey baru dibuat
     * @param surveyId ID unik dari survey
     * @param proxy Alamat BeaconProxy untuk survey
     * @param owner Alamat owner survey
     * @param symbol Symbol survey
     */
    event SurveyCreated(
        uint256 indexed surveyId,
        address indexed proxy,
        address indexed owner,
        string symbol
    );

    /**
     * @dev Constructor factory
     * @param _beacon Alamat beacon contract yang akan digunakan
     * @param _owner Alamat yang akan menjadi owner factory
     */
    constructor(address _beacon, address _owner) Ownable(_owner) {
        require(_beacon != address(0), "Beacon cannot be zero address");
        beacon = ConfidentialSurvey_Beacon(_beacon);
    }

    /**
     * @dev Membuat survey baru menggunakan BeaconProxy
     * @param _owner Address yang akan menjadi owner survey
     * @param _symbol Symbol untuk survey (Required. Max 10 characters)
     * @param _metadataCID IPFS CID berisi metadata survey
     * @param _questionsCID IPFS CID berisi pertanyaan survey
     * @param _totalQuestions Total jumlah pertanyaan dalam survey
     * @param _respondentLimit Maksimum jumlah responden yang diizinkan (1-1000)
     * @return surveyId ID unik survey yang baru dibuat
     * @return proxy Alamat BeaconProxy untuk survey yang baru dibuat
     */
    function createSurvey(
        address _owner,
        string memory _symbol,
        string memory _metadataCID,
        string memory _questionsCID,
        uint256 _totalQuestions,
        uint256 _respondentLimit
    ) external nonReentrant returns (uint256 surveyId, address proxy) {
        require(_owner != address(0), "Owner cannot be zero address");

        surveyId = totalSurveys++;

        // Encode data untuk initialize function
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,string,string,string,uint256,uint256)",
            _owner,
            _symbol,
            _metadataCID,
            _questionsCID,
            _totalQuestions,
            _respondentLimit
        );

        // Deploy BeaconProxy
        proxy = address(new BeaconProxy(address(beacon), initData));

        // Update mappings
        surveys[surveyId] = proxy;
        surveyIds[proxy] = surveyId;
        ownerSurveys[_owner].push(surveyId);
        allSurveys.push(proxy);

        emit SurveyCreated(surveyId, proxy, _owner, _symbol);
    }

    /**
     * @dev Mendapatkan semua survey yang dimiliki oleh owner tertentu
     * @param _owner Alamat owner
     * @return Array berisi ID survey yang dimiliki owner
     */
    function getSurveysByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerSurveys[_owner];
    }

    /**
     * @dev Mendapatkan alamat proxy dari survey ID
     * @param _surveyId ID survey
     * @return Alamat proxy contract survey
     */
    function getSurveyAddress(
        uint256 _surveyId
    ) external view returns (address) {
        return surveys[_surveyId];
    }

    /**
     * @dev Mendapatkan survey ID dari alamat proxy
     * @param _proxy Alamat proxy contract
     * @return ID survey
     */
    function getSurveyId(address _proxy) external view returns (uint256) {
        return surveyIds[_proxy];
    }

    /**
     * @dev Mendapatkan semua alamat survey yang pernah dibuat
     * @return Array berisi semua alamat survey
     */
    function getAllSurveys() external view returns (address[] memory) {
        return allSurveys;
    }

    /**
     * @dev Mendapatkan alamat beacon yang digunakan
     * @return Alamat beacon contract
     */
    function getBeacon() external view returns (address) {
        return address(beacon);
    }

    /**
     * @dev Mendapatkan alamat implementasi saat ini dari beacon
     * @return Alamat implementasi yang sedang aktif
     */
    function getCurrentImplementation() external view returns (address) {
        return beacon.implementation();
    }

    /**
     * @dev Mendapatkan jumlah survey yang dimiliki owner tertentu
     * @param _owner Alamat owner
     * @return Jumlah survey
     */
    function getSurveyCountByOwner(
        address _owner
    ) external view returns (uint256) {
        return ownerSurveys[_owner].length;
    }

    /**
     * @dev Mengecek apakah alamat adalah survey yang valid
     * @param _proxy Alamat yang akan dicek
     * @return true jika alamat adalah survey yang valid
     */
    function isValidSurvey(address _proxy) external view returns (bool) {
        return
            surveyIds[_proxy] < totalSurveys &&
            surveys[surveyIds[_proxy]] == _proxy;
    }
}
