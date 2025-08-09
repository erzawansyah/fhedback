// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ConfidentialSurvey_Beacon.sol";

/**
 * @title ConfidentialSurvey_Factory
 * @dev Factory contract to create ConfidentialSurvey instances using the BeaconProxy pattern
 * @notice This contract enables creation of surveys that can be upgraded via beacon
 */
contract ConfidentialSurvey_Factory is Ownable, ReentrancyGuard {
    /// @dev Address of the beacon contract
    ConfidentialSurvey_Beacon public immutable beacon;

    /// @dev Counter for total surveys created
    uint256 public totalSurveys;

    /// @dev Mapping from survey ID to proxy contract address
    mapping(uint256 => address) public surveys;

    /// @dev Mapping from owner address to array of owned survey IDs
    mapping(address => uint256[]) public ownerSurveys;

    /// @dev Mapping from proxy address to survey ID
    mapping(address => uint256) public surveyIds;

    /// @dev Array of all survey addresses for enumeration
    address[] public allSurveys;

    /**
     * @dev Event emitted when a new survey is created
     * @param surveyId Unique ID of the survey
     * @param proxy BeaconProxy address for the survey
     * @param owner Owner address of the survey
     * @param symbol Survey symbol
     */
    event SurveyCreated(
        uint256 indexed surveyId,
        address indexed proxy,
        address indexed owner,
        string symbol
    );

    /**
     * @dev Factory constructor
     * @param _beacon Address of the beacon contract to use
     * @param _owner Address to be set as the factory owner
     */
    constructor(address _beacon, address _owner) Ownable(_owner) {
        require(_beacon != address(0), "Beacon cannot be zero address");
        beacon = ConfidentialSurvey_Beacon(_beacon);
    }

    /**
     * @dev Creates a new survey using BeaconProxy
     * @param _owner Address to be set as the survey owner
     * @param _symbol Symbol for the survey (Required. Max 10 characters)
     * @param _metadataCID IPFS CID containing survey metadata
     * @param _questionsCID IPFS CID containing survey questions
     * @param _totalQuestions Total number of questions in the survey
     * @param _respondentLimit Maximum number of allowed respondents (1-1000)
     * @return surveyId Unique ID of the newly created survey
     * @return proxy BeaconProxy address for the newly created survey
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

        // Encode data for initialize function
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
     * @dev Gets all surveys owned by a specific owner
     * @param _owner Owner address
     * @return Array of survey IDs owned by the owner
     */
    function getSurveysByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerSurveys[_owner];
    }

    /**
     * @dev Gets the proxy address for a given survey ID
     * @param _surveyId Survey ID
     * @return Proxy contract address of the survey
     */
    function getSurveyAddress(
        uint256 _surveyId
    ) external view returns (address) {
        return surveys[_surveyId];
    }

    /**
     * @dev Gets the survey ID for a given proxy address
     * @param _proxy Proxy contract address
     * @return Survey ID
     */
    function getSurveyId(address _proxy) external view returns (uint256) {
        return surveyIds[_proxy];
    }

    /**
     * @dev Gets all survey addresses ever created
     * @return Array of all survey addresses
     */
    function getAllSurveys() external view returns (address[] memory) {
        return allSurveys;
    }

    /**
     * @dev Gets the beacon address in use
     * @return Beacon contract address
     */
    function getBeacon() external view returns (address) {
        return address(beacon);
    }

    /**
     * @dev Gets the current implementation address from the beacon
     * @return Currently active implementation address
     */
    function getCurrentImplementation() external view returns (address) {
        return beacon.implementation();
    }

    /**
     * @dev Gets the number of surveys owned by a specific owner
     * @param _owner Owner address
     * @return Number of surveys
     */
    function getSurveyCountByOwner(
        address _owner
    ) external view returns (uint256) {
        return ownerSurveys[_owner].length;
    }

    /**
     * @dev Checks if an address is a valid survey
     * @param _proxy Address to check
     * @return true if the address is a valid survey
     */
    function isValidSurvey(address _proxy) external view returns (bool) {
        return
            surveyIds[_proxy] < totalSurveys &&
            surveys[surveyIds[_proxy]] == _proxy;
    }

    /**
     * @dev Query the latest survey created with pagination and offset. Max limit per query is 50
     * @param _offset Offset for pagination
     * @param _limit Limit for pagination
     * @return Array of survey IDs and a flag indicating if there is a next page
     */
    function queryLatestSurveys(
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory, bool) {
        require(_offset < totalSurveys, "Invalid offset");
        require(_limit > 0 && _limit <= 50, "Limit must be between 1 and 50");
        uint256 end = _offset + _limit > totalSurveys
            ? totalSurveys
            : _offset + _limit;
        uint256[] memory result = new uint256[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = ownerSurveys[allSurveys[i]].length;
        }
        return (result, end < totalSurveys);
    }
}
