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
contract ConfidentialSurvey is ConfidentialSurvey_Stats {
    // ------------------------------------------------------------------------
    // Constants & Types
    // ------------------------------------------------------------------------
    uint256 private constant MAX_RESPONDENTS = 1000;

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

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------
    event SurveyCreated(address indexed owner, string title);
    event SurveyMetadataUpdated(string metadataCID);
    event SurveyQuestionsUpdated(uint256 totalQuestions);
    event SurveyPublished();
    event SurveyClosed(uint256 totalRespondents);
    event SurveyDeleted();

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------
    SurveyDetails public survey;

    uint256 public totalRespondents;
    mapping(address => bool) internal hasResponded;
    address[] internal respondents;
    mapping(address => mapping(uint256 => euint8)) internal responses;

    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == survey.owner, "Not owner");
        _;
    }
    modifier onlyActiveSurvey() {
        require(survey.status == SurveyStatus.Active, "Not active");
        _;
    }
    modifier onlyClosedSurvey() {
        require(survey.status == SurveyStatus.Closed, "Not closed");
        _;
    }
    modifier notTrashed() {
        require(survey.status != SurveyStatus.Trashed, "Trashed");
        _;
    }
    modifier notActive() {
        require(survey.status != SurveyStatus.Active, "Already active");
        _;
    }
    modifier canEditOrDelete() {
        require(
            survey.status == SurveyStatus.Created,
            "Immutable in current status"
        );
        _;
    }
    modifier notResponded() {
        require(!hasResponded[msg.sender], "Already responded");
        _;
    }

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // Management (non‑FHE)
    // ------------------------------------------------------------------------
    function updateSurveyMetadata(
        string calldata _metadataCID
    ) external onlyOwner notTrashed canEditOrDelete {
        survey.metadataCID = _metadataCID;
        emit SurveyMetadataUpdated(_metadataCID);
    }

    function updateQuestions(
        string calldata _questionsCID,
        uint256 _totalQuestions
    ) external onlyOwner notTrashed canEditOrDelete {
        survey.questionsCID = _questionsCID;
        survey.totalQuestions = _totalQuestions;
        emit SurveyQuestionsUpdated(_totalQuestions);
    }

    /**
     * @notice Publish the survey and initialise stats for every question.
     * @param _questionIndexes Sorted list of question indexes (0‑based).
     * @param _maxScores       Max score for each question (same length).
     */
    function publishSurvey(
        uint256[] calldata _questionIndexes,
        uint8[] calldata _maxScores
    ) external onlyOwner notTrashed notActive {
        require(
            _questionIndexes.length == _maxScores.length,
            "Length mismatch"
        );
        require(
            _questionIndexes.length == survey.totalQuestions,
            "Wrong question count"
        );

        for (uint256 i = 0; i < _questionIndexes.length; i++) {
            uint256 qIdx = _questionIndexes[i];
            uint8 mScore = _maxScores[i];

            require(qIdx < survey.totalQuestions, "Bad index");
            require(mScore > 0, "Bad max score");

            _initializeQuestionStatistics(qIdx, mScore);
        }

        survey.status = SurveyStatus.Active;
        emit SurveyPublished();
    }

    function closeSurvey() external onlyOwner onlyActiveSurvey {
        survey.status = SurveyStatus.Closed;
        emit SurveyClosed(totalRespondents);
    }

    function deleteSurvey() external onlyOwner notActive {
        survey.status = SurveyStatus.Trashed;
        emit SurveyDeleted();
    }

    // ------------------------------------------------------------------------
    // Respondent interaction (FHE)
    // ------------------------------------------------------------------------
    function submitResponses(
        externalEuint8[] calldata _encryptedResponses,
        bytes calldata _inputProof
    ) external onlyActiveSurvey notResponded {
        require(
            _encryptedResponses.length == survey.totalQuestions,
            "Wrong responses length"
        );
        require(
            totalRespondents < survey.respondentLimit,
            "Respondent limit reached"
        );

        _initializeRespondentStatistics(msg.sender);

        for (uint256 i = 0; i < _encryptedResponses.length; i++) {
            // Decode ciphertext → euint8
            euint8 response = FHE.fromExternal(
                _encryptedResponses[i],
                _inputProof
            );
            FHE.allowThis(response); // give contract ACL for further ops
            FHE.allow(response, msg.sender); // give respondent ACL to decrypt value

            // Persist & update stats
            responses[msg.sender][i] = response;
            _updateQuestionStatistics(i, response);
            _updateRespondentStatistics(msg.sender, response);
        }

        // mark respondent
        hasResponded[msg.sender] = true;
        respondents.push(msg.sender);
        totalRespondents += 1;

        // auto‑close when full
        if (totalRespondents >= survey.respondentLimit) {
            survey.status = SurveyStatus.Closed;
            emit SurveyClosed(totalRespondents);
        }
    }
}
