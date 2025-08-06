// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ConfidentialSurvey_Stats} from "./modules/ConfidentialSurvey_Stats.sol";

/**
 * @title ConfidentialSurvey
 * @dev Enables creation and management of privacy-preserving surveys using Zama's FHE (Fully Homomorphic Encryption).
 * @author M.E.W (github: erzawansyah)
 */
contract ConfidentialSurvey is SepoliaConfig, ConfidentialSurvey_Stats {
    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------
    uint256 private constant MAX_RESPONDENTS = 1000; // Maximum number of respondents per survey

    // ------------------------------------------------------------------------
    // Event Definitions
    // ------------------------------------------------------------------------

    /**
     * @dev Emitted when a new survey is created.
     * @param owner Address of the survey creator.
     * @param title Title of the survey.
     */
    event SurveyCreated(address indexed owner, string title);

    /**
     * @dev Emitted when survey metadata is updated.
     * @param metadataCID IPFS CID or similar for survey metadata.
     */
    event SurveyMetadataUpdated(string metadataCID);

    /**
     * @dev Emitted when a question is added to the survey.
     * @param totalQuestions Total number of questions after addition.
     */
    event SurveyQuestionsUpdated(uint256 totalQuestions);

    /**
     * @dev Emitted when owner set survey status to Published
     */
    event SurveyPublished();

    /**
     * @dev Emitted when the survey is closed.
     */
    event SurveyClosed(uint256 totalRespondents);

    /**
     * @dev Emitted when the survey is deleted or trashed.
     */
    event SurveyDeleted();

    // ------------------------------------------------------------------------
    // Enumerations
    // ------------------------------------------------------------------------
    /**
     * @dev Represents the status of a survey.
     */
    enum SurveyStatus {
        Initialized, // Survey is initialized but not yet configured
        Draft, // Survey is being drafted
        Active, // Survey is open for responses
        Closed, // Survey is closed for responses
        Trashed // Survey is deleted or trashed
    }

    // ------------------------------------------------------------------------
    // Structs
    // ------------------------------------------------------------------------
    /**
     * @dev Stores metadata and configuration for a survey.
     */
    struct SurveyDetails {
        string title; // Title of the survey
        string metadataCID; // IPFS CID or similar for survey metadata
        string questionsCID; // IPFS CID or similar for questions metadata
        uint256 totalQuestions; // Total number of questions in the survey
        uint256 createdAt; // Timestamp when the survey was created
        address owner; // Address of the survey creator
        uint256 respondentLimit; // Maximum number of respondents allowed
        SurveyStatus status; // Current status of the survey
    }

    // ------------------------------------------------------------------------
    // Public State Variables
    // ------------------------------------------------------------------------

    // Survey metadata and configuration
    SurveyDetails public survey;

    // Total number of respondents who have submitted responses
    uint256 public totalRespondents;

    // ------------------------------------------------------------------------
    // Internal State Variables
    // ------------------------------------------------------------------------

    // Mapping to track if an address has responded
    /// @dev Used to track if a respondent has already submitted their responses
    mapping(address => bool) internal hasResponded;

    // List of respondents who have submitted responses
    /// @dev Used to gather all respondents' addresses for statistics and management
    address[] internal respondents;

    // Mapping to store encrypted responses: respondent address => (question index => encrypted answer)
    mapping(address => mapping(uint256 => euint8)) internal responses;

    // ------------------------------------------------------------------------
    // TODO: Add any state variables needed to manage rewards, penalties, expiration, etc.
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------
    /**
     * @dev Ensures the caller is the survey owner.
     */
    modifier onlyOwner() {
        require(msg.sender == survey.owner, "Not the survey owner");
        _;
    }

    /**
     * @dev Ensures the survey is in the Active state.
     */
    modifier onlyActiveSurvey() {
        require(survey.status == SurveyStatus.Active, "Survey is not active");
        _;
    }

    /**
     * @dev Ensures the survey is in the Closed state.
     */
    modifier onlyClosedSurvey() {
        require(survey.status == SurveyStatus.Closed, "Survey is not closed");
        _;
    }

    /**
     * @dev Ensures the survey is not trashed.
     */
    modifier notTrashed() {
        require(survey.status != SurveyStatus.Trashed, "Survey is trashed");
        _;
    }

    /**
     * @dev Ensures the survey is not published.
     */
    modifier notActive() {
        require(survey.status != SurveyStatus.Active, "Survey is active");
        _;
    }

    /**
     * @dev Ensures the survey is in the Initialized or Draft state.
     */
    modifier canEditOrDelete() {
        require(
            survey.status == SurveyStatus.Initialized ||
                survey.status == SurveyStatus.Draft,
            "Cannot edit or delete in current status"
        );
        _;
    }

    /**
     * @dev Ensures user has not responded yet.
     */
    modifier notResponded() {
        require(
            !hasResponded[msg.sender],
            "Respondent has already submitted responses"
        );
        _;
    }

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    /**
     * @dev Initializes the contract with default values.
     * @param _owner Address of the survey creator (should be the deployer).
     * @param _title Title of the survey.
     * @param _metadataCID IPFS CID or similar for survey metadata.
     * @param _questionsCID IPFS CID or similar for questions metadata.
     * @param _totalQuestions Total number of questions in the survey.
     * @param _respondentLimit Maximum number of respondents allowed.
     */
    constructor(
        address _owner,
        string memory _title,
        string memory _metadataCID,
        string memory _questionsCID,
        uint256 _totalQuestions,
        uint256 _respondentLimit
    ) {
        require(
            _respondentLimit > 0 && _respondentLimit <= MAX_RESPONDENTS,
            "Invalid respondent limit"
        );

        survey.title = _title;
        survey.metadataCID = _metadataCID;
        survey.questionsCID = _questionsCID;
        survey.totalQuestions = _totalQuestions;
        survey.createdAt = block.timestamp;
        survey.owner = _owner;
        survey.respondentLimit = _respondentLimit;
        survey.status = SurveyStatus.Initialized;

        emit SurveyCreated(_owner, _title);
    }

    // ------------------------------------------------------------------------
    // Public Functions (Non FHE)
    // ------------------------------------------------------------------------

    /**
     * @dev Owner can update the survey metadata when status is Initialized or Draft.
     * @param _metadataCID New IPFS CID or similar for survey metadata.
     */
    function updateSurveyMetadata(
        string memory _metadataCID
    ) external onlyOwner notTrashed canEditOrDelete {
        survey.metadataCID = _metadataCID;
        emit SurveyMetadataUpdated(_metadataCID);
    }

    /**
     * @dev Owner can add questions to the survey when status is Initialized or Draft.
     * @param _questionsCID New IPFS CID or similar for questions metadata.
     * @param _totalQuestions Total number of questions after addition.
     */
    function updateQuestions(
        string memory _questionsCID,
        uint256 _totalQuestions
    ) external onlyOwner notTrashed canEditOrDelete {
        survey.questionsCID = _questionsCID;
        survey.totalQuestions = _totalQuestions;
        emit SurveyQuestionsUpdated(_totalQuestions);
    }

    /**
     * @dev Owner can publish the survey, changing its status to Active.
     */
    function publishSurvey(
        uint256[] memory _questionIndexes,
        uint8[] memory _maxScores
    ) external onlyOwner notTrashed notActive {
        require(
            _questionIndexes.length == _maxScores.length,
            "Mismatched question indexes and max scores"
        );
        require(
            _questionIndexes.length == survey.totalQuestions,
            "Invalid number of questions"
        );

        for (uint256 i = 0; i < _questionIndexes.length; i++) {
            uint256 questionIndex = _questionIndexes[i];
            uint8 maxScore = _maxScores[i];

            require(
                questionIndex < survey.totalQuestions,
                "Invalid question index"
            );
            require(maxScore > 0, "Invalid max score");

            // Initialize question statistics
            initializeQuestionStatistics(questionIndex, maxScore);
        }

        survey.status = SurveyStatus.Active;
        emit SurveyPublished();
    }

    /**
     * @dev Owner can close the survey, changing its status to Closed.
     */
    function closeSurvey() external onlyOwner onlyActiveSurvey {
        survey.status = SurveyStatus.Closed;
        emit SurveyClosed(totalRespondents);
    }

    /**
     * @dev Owner can delete or trash the survey, changing its status to Trashed.
     */
    function deleteSurvey() external onlyOwner canEditOrDelete {
        survey.status = SurveyStatus.Trashed;
        emit SurveyDeleted();
    }

    // ------------------------------------------------------------------------
    // FHE Functions (Privacy-Preserving)
    // ------------------------------------------------------------------------

    /**
     * @dev Respondents can submit their responses to the survey.
     * @param _encryptedResponses Array of encrypted responses for each question.
     * @param _inputProof FHE input proof for the encrypted responses.
     */
    function submitResponses(
        externalEuint8[] calldata _encryptedResponses,
        bytes calldata _inputProof
    ) external onlyActiveSurvey notResponded {
        require(
            _encryptedResponses.length == survey.totalQuestions,
            "Invalid number of responses"
        );
        require(
            totalRespondents < survey.respondentLimit,
            "Respondent limit reached"
        );

        for (uint256 i = 0; i < _encryptedResponses.length; i++) {
            euint8 _response = FHE.fromExternal(
                _encryptedResponses[i],
                _inputProof
            );
            FHE.allowThis(_response);

            // Update the question statistics
            updateQuestionStatistics(i, _response);
            responses[msg.sender][i] = _response;
        }

        // Mark the respondent as having submitted responses
        hasResponded[msg.sender] = true;
        respondents.push(msg.sender);
        totalRespondents++;

        if (totalRespondents >= survey.respondentLimit) {
            // Automatically close the survey if respondent limit is reached
            survey.status = SurveyStatus.Closed;
            emit SurveyClosed(totalRespondents);
        }
    }
}
