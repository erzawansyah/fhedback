// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ConfidentialSurvey_Stats} from "./modules/ConfidentialSurvey_Stats.sol";

/**
 * @title ConfidentialSurvey (main logic)
 * @dev Inherits ConfidentialSurvey_Stats for statistical bookkeeping.
 */
contract ConfidentialSurvey is ConfidentialSurvey_Stats, ReentrancyGuard {
    // ------------------------------ CONSTANTS ----------------------------- //
    uint256 private constant MAX_RESPONDENTS = 1000;

    // ------------------------------ ENUMS & STRUCTS ---------------------- //
    enum SurveyStatus {
        Created,
        Active,
        Closed,
        Trashed
    }

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

    // ------------------------------ EVENTS ------------------------------ //
    event SurveyCreated(address indexed owner, string title);
    event SurveyMetadataUpdated(string cid);
    event SurveyQuestionsUpdated(uint256 totalQuestions);
    event SurveyPublished();
    event SurveyClosed(uint256 totalRespondents);
    event SurveyDeleted();

    // ------------------------------ STORAGE ----------------------------- //
    SurveyDetails public survey;

    uint256 public totalRespondents;
    mapping(address => bool) internal hasResponded;
    address[] internal respondents; // small (≤1000) –‑ enumeration acceptable
    mapping(address => mapping(uint256 => euint8)) internal responses; // respondent ⇒ (qIdx ⇒ answer)

    // ------------------------------ MODIFIERS --------------------------- //
    modifier onlyOwner() {
        require(msg.sender == survey.owner, "not owner");
        _;
    }
    modifier onlyActive() {
        require(survey.status == SurveyStatus.Active, "not active");
        _;
    }
    modifier onlyClosed() {
        require(survey.status == SurveyStatus.Closed, "not closed");
        _;
    }
    modifier notTrashed() {
        require(survey.status != SurveyStatus.Trashed, "trashed");
        _;
    }
    modifier notActive() {
        require(survey.status != SurveyStatus.Active, "already active");
        _;
    }
    modifier canEditOrDelete() {
        require(survey.status == SurveyStatus.Created, "immutable state");
        _;
    }
    modifier notResponded() {
        require(!hasResponded[msg.sender], "already responded");
        _;
    }

    // ------------------------------ CONSTRUCTOR ------------------------ //
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

    // --------------------------- MANAGEMENT (public) -------------------- //
    function updateSurveyMetadata(
        string calldata _cid
    ) external onlyOwner notTrashed canEditOrDelete {
        survey.metadataCID = _cid;
        emit SurveyMetadataUpdated(_cid);
    }

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
     * @notice Publish the survey and initialise encrypted statistics per question.
     * @dev    Owner must provide the max score for each question. The value is
     *         limited by `MAX_SCORE_PER_QUESTION` to keep gas usage bounded.
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

    function closeSurvey() external onlyOwner onlyActive {
        survey.status = SurveyStatus.Closed;
        emit SurveyClosed(totalRespondents);
    }

    function deleteSurvey() external onlyOwner notActive {
        survey.status = SurveyStatus.Trashed;
        emit SurveyDeleted();
    }

    // ------------------------ RESPONDENT INTERACTION -------------------- //
    /**
     * @param _encryptedResponses Ciphertext handles, 1‑to‑1 with survey questions.
     * @param _proofs              ZK‑proofs attesting each ciphertext is well‑formed.
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

    // -------------------------- OWNER‑SIDE HELPERS ---------------------- //
    /**
     * @notice Allow the survey owner to decrypt aggregated stats for a question
     *         once the survey is closed. This keeps data hidden during the vote
     *         but makes post‑analysis possible.
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
