// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ConfidentialSurvey_Stats} from "./modules/ConfidentialSurvey_Stats.sol";

/**
 * @title ConfidentialSurvey
 * @dev A privacy-preserving survey system using Fully Homomorphic Encryption (FHE).
 *      Allows surveys to be conducted with encrypted responses, enabling statistical analysis
 *      without revealing individual responses. Inherits ConfidentialSurvey_Stats for
 *      statistical bookkeeping and uses ReentrancyGuard for security.
 * @author M.E.W (github: erzawansyah)
 * @notice This contract enables creation of confidential surveys where responses remain
 *         encrypted throughout the entire process, only revealing aggregated statistics
 *         to the survey owner after the survey is closed.
 */
contract ConfidentialSurvey is ConfidentialSurvey_Stats, ReentrancyGuard {
    // -------------------------------------
    // Constants
    // -------------------------------------
    /// @dev Maximum number of respondents allowed per survey (gas optimization limit)
    uint256 private constant MAX_RESPONDENTS = 1000;

    // -------------------------------------
    // Enums & Structs
    // -------------------------------------
    /**
     * @dev Survey lifecycle states
     * @param Created Initial state when survey is created but not yet published
     * @param Active Survey is live and accepting responses
     * @param Closed Survey has been closed, no more responses accepted
     * @param Trashed Survey has been deleted/trashed
     */
    enum SurveyStatus {
        Created,
        Active,
        Closed,
        Trashed
    }

    /**
     * @dev Complete survey metadata and configuration
     * @param title Human-readable title of the survey
     * @param metadataCID IPFS CID containing survey metadata
     * @param questionsCID IPFS CID containing survey questions
     * @param totalQuestions Number of questions in the survey
     * @param createdAt Timestamp when survey was created
     * @param owner Address of the survey creator/owner
     * @param respondentLimit Maximum number of allowed respondents
     * @param status Current status of the survey
     */
    struct SurveyDetails {
        string title;
        string metadataCID;
        string questionsCID;
        uint256 totalQuestions;
        uint256 createdAt;
        address owner;
        uint256 respondentLimit;
        SurveyStatus status;
    }

    // -------------------------------------
    // Events
    // -------------------------------------
    /**
     * @dev Emitted when a new survey is created
     * @param owner Address of the survey creator
     * @param title Title of the created survey
     */
    event SurveyCreated(address indexed owner, string title);

    /**
     * @dev Emitted when survey metadata is updated
     * @param cid New IPFS CID for the metadata
     */
    event SurveyMetadataUpdated(string cid);

    /**
     * @dev Emitted when survey questions are updated
     * @param totalQuestions New total number of questions
     */
    event SurveyQuestionsUpdated(uint256 totalQuestions);

    /**
     * @dev Emitted when survey is published and becomes active
     */
    event SurveyPublished();

    /**
     * @dev Emitted when survey is closed
     * @param totalRespondents Final number of respondents who participated
     */
    event SurveyClosed(uint256 totalRespondents);

    /**
     * @dev Emitted when survey is deleted/trashed
     */
    event SurveyDeleted();

    // -------------------------------------
    // Storage
    // -------------------------------------
    /// @notice Complete survey configuration and metadata
    SurveyDetails public survey;

    /// @notice Current number of users who have submitted responses
    uint256 public totalRespondents;

    /// @dev Tracks whether each address has already responded to prevent duplicate submissions
    mapping(address => bool) internal hasResponded;

    /// @dev Array of all respondent addresses for enumeration (limited to MAX_RESPONDENTS for gas efficiency)
    address[] internal respondents; // small (≤1000) –‑ enumeration acceptable

    /// @dev Encrypted responses: respondent address => question index => encrypted answer
    mapping(address => mapping(uint256 => euint8)) internal responses; // respondent ⇒ (qIdx ⇒ answer)

    // -------------------------------------
    // Modifiers
    // -------------------------------------
    /**
     * @dev Restricts function access to survey owner only
     */
    modifier onlyOwner() {
        require(msg.sender == survey.owner, "not owner");
        _;
    }

    /**
     * @dev Restricts function access to when survey is active
     */
    modifier onlyActive() {
        require(survey.status == SurveyStatus.Active, "not active");
        _;
    }

    /**
     * @dev Restricts function access to when survey is closed
     */
    modifier onlyClosed() {
        require(survey.status == SurveyStatus.Closed, "not closed");
        _;
    }

    /**
     * @dev Restricts function access when survey is not trashed
     */
    modifier notTrashed() {
        require(survey.status != SurveyStatus.Trashed, "trashed");
        _;
    }

    /**
     * @dev Restricts function access when survey is not active
     */
    modifier notActive() {
        require(survey.status != SurveyStatus.Active, "already active");
        _;
    }

    /**
     * @dev Restricts function access to when survey can be edited (Created state only)
     */
    modifier canEditOrDelete() {
        require(survey.status == SurveyStatus.Created, "immutable state");
        _;
    }

    /**
     * @dev Restricts function access to users who haven't responded yet
     */
    modifier notResponded() {
        require(!hasResponded[msg.sender], "already responded");
        _;
    }

    // -------------------------------------
    // Constructor
    // -------------------------------------
    /**
     * @dev Creates a new confidential survey with specified parameters
     * @param _owner Address that will own and manage the survey
     * @param _title Human-readable title for the survey
     * @param _metadataCID IPFS CID containing survey metadata
     * @param _questionsCID IPFS CID containing survey questions
     * @param _totalQuestions Total number of questions in the survey
     * @param _respondentLimit Maximum number of respondents allowed (1-1000)
     * @notice Survey starts in Created state and must be published to accept responses
     * @notice Emits SurveyCreated event upon successful creation
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
            "bad respondentLimit"
        );
        require(_totalQuestions > 0, "totalQuestions = 0");

        survey = SurveyDetails({
            title: _title,
            metadataCID: _metadataCID,
            questionsCID: _questionsCID,
            totalQuestions: _totalQuestions,
            createdAt: block.timestamp,
            owner: _owner,
            respondentLimit: _respondentLimit,
            status: SurveyStatus.Created
        });

        emit SurveyCreated(_owner, _title);
    }

    // -------------------------------------
    // Management (public)
    // -------------------------------------
    /**
     * @dev Updates the survey metadata IPFS CID
     * @param _cid New IPFS CID for the survey metadata
     * @notice Only available during Created state before survey is published
     * @notice Emits SurveyMetadataUpdated event
     */
    function updateSurveyMetadata(
        string calldata _cid
    ) external onlyOwner notTrashed canEditOrDelete {
        survey.metadataCID = _cid;
        emit SurveyMetadataUpdated(_cid);
    }

    /**
     * @dev Updates the survey questions and total question count
     * @param _cid New IPFS CID for the survey questions
     * @param _totalQuestions New total number of questions
     * @notice Only available during Created state before survey is published
     * @notice Emits SurveyQuestionsUpdated event
     */
    function updateQuestions(
        string calldata _cid,
        uint256 _totalQuestions
    ) external onlyOwner notTrashed canEditOrDelete {
        require(_totalQuestions > 0, "totalQuestions = 0");
        survey.questionsCID = _cid;
        survey.totalQuestions = _totalQuestions;
        emit SurveyQuestionsUpdated(_totalQuestions);
    }

    /**
     * @notice Publishes the survey and initializes encrypted statistics per question
     * @dev Owner must provide the max score for each question. The value is
     *      limited by `MAX_SCORE_PER_QUESTION` to keep gas usage bounded.
     * @param _questionIdx Array of question indices (must match totalQuestions)
     * @param _maxScores Array of maximum scores for each question (2-10)
     * @notice Changes survey status to Active and emits SurveyPublished event
     * @notice Once published, survey questions and metadata become immutable
     */
    function publishSurvey(
        uint256[] calldata _questionIdx,
        uint8[] calldata _maxScores
    ) external onlyOwner notTrashed notActive {
        require(_questionIdx.length == _maxScores.length, "length mismatch");
        require(_questionIdx.length == survey.totalQuestions, "wrong count");

        for (uint256 i = 0; i < _questionIdx.length; ++i) {
            uint256 q = _questionIdx[i];
            uint8 m = _maxScores[i];

            require(q < survey.totalQuestions, "bad index");
            require(m > 1 && m <= MAX_SCORE_PER_QUESTION, "maxScore invalid");

            _initializeQuestionStatistics(q, m);
        }

        survey.status = SurveyStatus.Active;
        emit SurveyPublished();
    }

    /**
     * @dev Closes the survey, preventing any new responses
     * @notice Only available when survey is active
     * @notice Emits SurveyClosed event with final respondent count
     */
    function closeSurvey() external onlyOwner onlyActive {
        survey.status = SurveyStatus.Closed;
        emit SurveyClosed(totalRespondents);
    }

    /**
     * @dev Permanently deletes/trashes the survey
     * @notice Only available when survey is not active
     * @notice This action is irreversible
     * @notice Emits SurveyDeleted event
     */
    function deleteSurvey() external onlyOwner notActive {
        survey.status = SurveyStatus.Trashed;
        emit SurveyDeleted();
    }

    // -------------------------------------
    // Respondent Interaction
    // -------------------------------------
    /**
     * @dev Submits encrypted responses to the survey
     * @param _encryptedResponses Array of encrypted response handles, one per question
     * @param _proofs Array of ZK-proofs validating each encrypted response
     * @notice Responses must be provided for all questions in the survey
     * @notice Each response must include a valid ZK-proof of well-formedness
     * @notice Users can only respond once and must do so while survey is active
     * @notice Automatically closes survey if respondent limit is reached
     * @notice Updates both question-level and respondent-level encrypted statistics
     */
    function submitResponses(
        externalEuint8[] calldata _encryptedResponses,
        bytes[] calldata _proofs
    ) external onlyActive notResponded nonReentrant {
        uint256 nQ = survey.totalQuestions;
        require(_encryptedResponses.length == nQ, "wrong responses len");
        require(_proofs.length == nQ, "wrong proofs len");
        require(totalRespondents < survey.respondentLimit, "respondent cap");

        _initializeRespondentStatistics(msg.sender);

        for (uint256 i = 0; i < nQ; ++i) {
            // Cast encrypted input → euint8 (with per‑ciphertext proof)
            euint8 resp = FHE.fromExternal(_encryptedResponses[i], _proofs[i]);
            FHE.allowThis(resp);
            FHE.allow(resp, msg.sender); // respondent can decrypt their answer

            responses[msg.sender][i] = resp;
            _updateQuestionStatistics(i, resp);
            _updateRespondentStatistics(msg.sender, resp);
        }

        hasResponded[msg.sender] = true;
        respondents.push(msg.sender);
        unchecked {
            ++totalRespondents;
        }

        if (totalRespondents >= survey.respondentLimit) {
            survey.status = SurveyStatus.Closed;
            emit SurveyClosed(totalRespondents);
        }
    }

    // -------------------------------------
    // Owner-Side Helpers
    // -------------------------------------
    /**
     * @notice Grants the survey owner permission to decrypt aggregated statistics for a question
     * @dev Only available after the survey is closed to preserve privacy during data collection
     * @param _qIdx Index of the question to grant decryption access for
     * @notice Allows owner to decrypt: total, sumSquares, minScore, maxScore, and frequency data
     * @notice This enables post-survey statistical analysis while maintaining respondent privacy
     * @notice Individual responses remain encrypted and inaccessible
     */
    function grantOwnerDecrypt(uint256 _qIdx) external onlyOwner onlyClosed {
        require(_qIdx < survey.totalQuestions, "bad index");
        QuestionStats storage qs = questionStatistics[_qIdx];

        FHE.allow(qs.total, msg.sender);
        FHE.allow(qs.sumSquares, msg.sender);
        FHE.allow(qs.minScore, msg.sender);
        FHE.allow(qs.maxScore, msg.sender);
        uint8 m = maxScores[_qIdx];
        for (uint8 i = 1; i <= m; ++i) {
            FHE.allow(qs.frequency[i], msg.sender);
        }
    }
}
