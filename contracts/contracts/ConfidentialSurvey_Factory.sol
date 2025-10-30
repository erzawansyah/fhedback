// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ConfidentialSurvey.sol";

/**
 * @title ConfidentialSurvey_Factory
 * @dev Factory contract to create ConfidentialSurvey instances directly
 * @notice This contract enables creation of surveys without proxy patterns
 */
contract ConfidentialSurvey_Factory is Ownable, ReentrancyGuard {
    // -------------------------------------
    // Storage
    // -------------------------------------

    /// @dev Counter for total surveys created
    uint256 public totalSurveys;

    /// @dev Mapping from survey ID to survey contract address
    mapping(uint256 => address) public surveys;

    /// @dev Mapping from owner address to array of owned survey IDs
    mapping(address => uint256[]) public ownerSurveys;

    /// @dev Mapping from survey address to survey ID
    mapping(address => uint256) public surveyIds;

    /// @dev Array of all survey addresses for enumeration
    address[] public allSurveys;

    // -------------------------------------
    // Events
    // -------------------------------------

    /**
     * @dev Event emitted when a new survey is created
     * @param surveyId Unique ID of the survey
     * @param survey ConfidentialSurvey contract address
     * @param owner Owner address of the survey
     * @param symbol Survey symbol
     */
    event SurveyCreated(
        uint256 indexed surveyId,
        address indexed survey,
        address indexed owner,
        string symbol
    );

    // -------------------------------------
    // Constructor
    // -------------------------------------

    /**
     * @dev Creates the factory contract
     * @param _owner Address to be set as the factory owner
     */
    constructor(address _owner) Ownable(_owner) {
        require(_owner != address(0), "Owner cannot be zero address");
    }

    // -------------------------------------
    // Survey Creation
    // -------------------------------------

    /**
     * @dev Creates a new survey by deploying ConfidentialSurvey directly
     * @param _owner Address to be set as the survey owner
     * @param _symbol Symbol for the survey (Required. Max 10 characters)
     * @param _metadataCID IPFS CID containing survey metadata
     * @param _questionsCID IPFS CID containing survey questions
     * @param _totalQuestions Total number of questions in the survey
     * @param _respondentLimit Maximum number of allowed respondents (1-1000)
     * @return surveyId Unique ID of the newly created survey
     * @return survey ConfidentialSurvey contract address
     */
    function createSurvey(
        address _owner,
        string memory _symbol,
        string memory _metadataCID,
        string memory _questionsCID,
        uint256 _totalQuestions,
        uint256 _respondentLimit
    ) external nonReentrant returns (uint256 surveyId, address survey) {
        require(_owner != address(0), "Owner cannot be zero address");
        require(
            bytes(_symbol).length > 0 && bytes(_symbol).length <= 10,
            "symbol length invalid"
        );
        require(
            _totalQuestions > 0 && _totalQuestions <= 30,
            "totalQuestions out of range"
        );
        require(
            _respondentLimit >= 1 && _respondentLimit <= 1000,
            "bad respondentLimit"
        );

        surveyId = totalSurveys++;

        // Deploy ConfidentialSurvey directly
        survey = address(
            new ConfidentialSurvey(
                _owner,
                _symbol,
                _metadataCID,
                _questionsCID,
                _totalQuestions,
                _respondentLimit
            )
        );

        // Update mappings
        surveys[surveyId] = survey;
        surveyIds[survey] = surveyId;
        ownerSurveys[_owner].push(surveyId);
        allSurveys.push(survey);

        emit SurveyCreated(surveyId, survey, _owner, _symbol);
    }

    // -------------------------------------
    // Survey Queries
    // -------------------------------------

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
            result[i - _offset] = i; // Return survey IDs, not owner survey counts
        }
        return (result, end < totalSurveys);
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
     * @param _survey Address to check
     * @return true if the address is a valid survey
     */
    function isValidSurvey(address _survey) external view returns (bool) {
        return
            surveyIds[_survey] < totalSurveys &&
            surveys[surveyIds[_survey]] == _survey;
    }
}
