// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ConfidentialSurvey_Base} from "./modules/ConfidentialSurvey_Base.sol";

/**
 * @custom:since 0.1.0
 * @title ConfidentialSurvey
 * @dev A privacy-preserving survey system using Fully Homomorphic Encryption (FHE).
 *      Allows surveys to be conducted with encrypted responses, enabling statistical analysis
 *      without revealing individual responses.
 * @author M.E.W (github: erzawansyah)
 * @notice This contract enables creation of confidential surveys where responses remain
 *         encrypted throughout the entire process, only revealing aggregated statistics
 *         to the survey owner after the survey is closed.
 */
contract ConfidentialSurvey is
    Initializable,
    ConfidentialSurvey_Base,
    ReentrancyGuardUpgradeable
{
    // -------------------------------------
    // Survey Management (Survey Creation, Metadata, Questions, Publishing)
    // -------------------------------------
    /**
     * @custom:since 0.1.0
     * @dev Creates a new confidential survey with specified parameters
     * @param _owner Address that will own and manage the survey
     * @param _symbol Symbol for the survey (Required. Max 10 characters)
     * @param _metadataCID IPFS CID containing survey metadata. TODO: Define metadata json schema and validation
     * @param _questionsCID IPFS CID containing survey questions. TODO: Define questions json schema and validation
     * @param _totalQuestions Total number of questions in the survey
     * @param _respondentLimit Maximum number of respondents allowed (1-1000)
     * @notice Survey starts in Created state and must be published to accept responses.
     * @notice metadataCID and questionsCID can be empty strings if not available at creation.
     * @notice Emits SurveyCreated event upon successful creation
     */
    function initialize(
        address _owner,
        string memory _symbol,
        string memory _metadataCID,
        string memory _questionsCID,
        uint256 _totalQuestions,
        uint256 _respondentLimit
    ) external initializer {
        require(
            _respondentLimit >= MIN_RESPONDENTS &&
                _respondentLimit <= MAX_RESPONDENTS,
            "bad respondentLimit"
        ); // Ensure respondent limit is within safe bounds
        require(
            bytes(_symbol).length > 0 && bytes(_symbol).length <= 10,
            "symbol length invalid"
        ); // Symbol must be between 1 and 10 characters
        require(
            _totalQuestions > 0 && _totalQuestions <= MAX_QUESTIONS,
            "totalQuestions out of range"
        );

        __ReentrancyGuard_init();

        survey = SurveyDetails({
            owner: _owner,
            symbol: _symbol,
            metadataCID: _metadataCID,
            questionsCID: _questionsCID,
            totalQuestions: _totalQuestions,
            createdAt: block.timestamp,
            respondentLimit: _respondentLimit,
            status: SurveyStatus.Created
        });

        emit SurveyCreated(_owner, _symbol, _metadataCID);
    }

    /**
     * @custom:since 0.1.0
     * @dev Updates the survey metadata IPFS CID
     * @param _cid New IPFS CID for the survey metadata. Needs to be validated against schema.
     * @notice Only available during Created state before survey is published
     * @notice Emits SurveyMetadataUpdated event
     */
    function updateSurveyMetadata(
        string calldata _cid
    ) external onlyOwner notTrashed canEditOrDelete {
        require(bytes(_cid).length > 0, "metadataCID cannot be empty");
        survey.metadataCID = _cid;
        emit SurveyMetadataUpdated(_cid);
    }

    /**
     * @custom:since 0.1.0
     * @dev Updates the survey questions and total question count
     * @param _cid New IPFS CID for the survey questions. Needs to be validated against schema.
     * @param _totalQuestions New total number of questions
     * @notice Only available during Created state before survey is published
     * @notice Emits SurveyQuestionsUpdated event
     * @notice Total questions must be between 1 and MAX_QUESTIONS (30)
     */
    function updateQuestions(
        string calldata _cid,
        uint256 _totalQuestions
    ) external onlyOwner notTrashed canEditOrDelete {
        require(bytes(_cid).length > 0, "questionsCID cannot be empty");
        require(
            _totalQuestions > 0 && _totalQuestions <= MAX_QUESTIONS,
            "totalQuestions out of range"
        );
        survey.questionsCID = _cid;
        survey.totalQuestions = _totalQuestions;
        emit SurveyQuestionsUpdated(_totalQuestions);
    }

    /**
     * @custom:since 0.1.0
     * @dev Owner must provide the max score for each question. Currently, the value is
     *      limited by `MAX_SCORE_PER_QUESTION` to keep gas usage bounded.
     * @param _maxScores Array of maximum scores for each question (2-10)
     * @notice Publishes the survey and initializes encrypted statistics per question
     * @notice Changes survey status to Active and emits SurveyPublished event
     * @notice Once published, survey questions and metadata become immutable
     */
    function publishSurvey(
        uint8[] calldata _maxScores
    ) external onlyOwner notTrashed notActive metadataAndQuestionsSet {
        require(survey.totalQuestions == _maxScores.length, "length mismatch");

        for (uint256 i = 0; i < survey.totalQuestions; ++i) {
            uint8 m = _maxScores[i];
            require(m > 1, "maxScore must be greater than 1");
            _initializeQuestionStatistics(i, m);
        }

        survey.status = SurveyStatus.Active;
        emit SurveyPublished();
    }

    /**
     * @custom:since 0.1.0
     * @dev Closes the survey, preventing any new responses
     * @notice Only available when survey is active
     * @notice Emits SurveyClosed event with final respondent count
     */
    function closeSurvey() external onlyOwner onlyActive minReached {
        survey.status = SurveyStatus.Closed;
        emit SurveyClosed(totalRespondents);
    }

    /**
     * @custom:since 0.1.0
     * @dev Permanently deletes/trashes the survey
     * @notice Only available when survey is not active
     * @notice This action is irreversible
     * @notice Emits SurveyDeleted event
     */
    function deleteSurvey() external onlyOwner notActive notTrashed {
        survey.status = SurveyStatus.Trashed;
        emit SurveyDeleted();
    }

    // -------------------------------------
    // Respondent Capabilities
    // -------------------------------------
    /**
     * @custom:since 0.1.0
     * @dev Submits encrypted responses to the survey
     * @param _encryptedResponses Array of encrypted response handles, one per question
     * @param _proofs ZK-proofs validating each encrypted response
     * @notice Responses must be provided for all questions in the survey
     * @notice Each response must include a valid ZK-proof of well-formedness
     * @notice Users can only respond once and must do so while survey is active
     * @notice Automatically closes survey if respondent limit is reached
     * @notice Updates both question-level and respondent-level encrypted statistics
     */
    function submitResponses(
        externalEuint8[] calldata _encryptedResponses,
        bytes calldata _proofs
    ) external onlyActive notResponded notOwner nonReentrant {
        uint256 nQ = survey.totalQuestions;
        require(_encryptedResponses.length == nQ, "wrong responses len");
        require(totalRespondents < survey.respondentLimit, "respondent cap");

        _initializeRespondentStatistics(msg.sender);

        for (uint256 i = 0; i < nQ; ++i) {
            euint8 resp = FHE.fromExternal(_encryptedResponses[i], _proofs);
            FHE.allowThis(resp);
            FHE.allow(resp, msg.sender); // respondent can decrypt their answer

            responses[msg.sender][i] = resp;
            // TODO: Possibly update question statistics here
            // This is currently commented out to avoid gas issues with large frequency maps
            // _updateQuestionStatistics(i, resp);
            _updateRespondentStatistics(msg.sender, resp);
        }
        _grantRespondentDecrypt(msg.sender); // allow respondent to decrypt their own stats
        hasResponded[msg.sender] = true;
        respondents.push(msg.sender);
        unchecked {
            ++totalRespondents;
        }
        emit ResponsesSubmitted();

        if (totalRespondents >= survey.respondentLimit) {
            survey.status = SurveyStatus.Closed;
            emit SurveyClosed(totalRespondents);
        }
    }

    // -------------------------------------
    // Owner Capabilities
    // -------------------------------------

    /**
     * @custom:since 0.1.0
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
            FHE.allow(frequencyCounts[_qIdx][i], msg.sender);
        }
    }

    // -------------------------------------
    // Statistics Functions
    // -------------------------------------
    /**
     * @custom:since 0.1.0
     * @dev Initializes encrypted statistics for a specific question
     * @param _questionIndex Index of the question to initialize
     * @param _max Maximum allowed score for this question (1-10)
     * @notice Sets up encrypted counters and frequency mappings for statistical tracking
     * @notice Grants permanent ACL permissions to the contract for all encrypted fields
     */
    function _initializeQuestionStatistics(
        uint256 _questionIndex,
        uint8 _max
    ) internal {
        require(_questionIndex < survey.totalQuestions, "bad index");
        require(
            _max > 1 && _max <= MAX_SCORE_PER_QUESTION,
            "maxScore out of range"
        );
        QuestionStats storage qs = questionStatistics[_questionIndex];

        qs.total = FHE.asEuint64(0);
        qs.sumSquares = FHE.asEuint64(0);
        qs.minScore = FHE.asEuint8(_max); // initialise min with max so first input wins
        qs.maxScore = FHE.asEuint8(_max);

        // Grant contract permanent ACL on all encrypted fields.
        FHE.allowThis(qs.total);
        FHE.allowThis(qs.sumSquares);
        FHE.allowThis(qs.minScore);
        FHE.allowThis(qs.maxScore);

        for (uint8 i = 1; i <= _max; ++i) {
            frequencyCounts[_questionIndex][i] = FHE.asEuint64(0);
            FHE.allowThis(frequencyCounts[_questionIndex][i]);
        }

        maxScores[_questionIndex] = _max;
    }

    /**
     * @custom:since 0.1.0
     * @dev Updates encrypted statistics when a new response is submitted for a question
     * @param _qIdx Index of the question being answered
     * @param _resp Encrypted response value (euint8)
     * @notice Updates total, sum of squares, min/max, and frequency distribution
     * @notice All operations are performed on encrypted data to maintain privacy
     */
    function _updateQuestionStatistics(uint256 _qIdx, euint8 _resp) internal {
        QuestionStats storage qs = questionStatistics[_qIdx];
        euint64 resp64 = FHE.asEuint64(_resp); // safe encrypted cast (8 → 64‑bit)
        FHE.allowThis(resp64); // allow contract to read this value

        qs.total = FHE.add(qs.total, resp64);
        FHE.allowThis(qs.total); // allow contract to read new value
        qs.sumSquares = FHE.add(qs.sumSquares, FHE.mul(resp64, resp64));
        FHE.allowThis(qs.sumSquares); // allow contract to read new value

        qs.minScore = FHE.select(
            FHE.lt(_resp, qs.minScore),
            _resp,
            qs.minScore
        );
        FHE.allowThis(qs.minScore); // allow contract to read new value

        qs.maxScore = FHE.select(
            FHE.gt(_resp, qs.maxScore),
            _resp,
            qs.maxScore
        );
        FHE.allowThis(qs.maxScore); // allow contract to read new value

        // TODO: Optimize frequency count updates
        // Increment frequency count for the given response value
        // CHANGE: Currently commented out to avoid gas issues with large frequency maps
        // This is a trade-off between gas cost and frequency count accuracy.
        // ===
        // uint8 maxPlain = maxScores[_qIdx];
        // for (uint8 i = 1; i <= maxPlain; ++i) {
        //     ebool isMatch = FHE.eq(_resp, FHE.asEuint8(i));
        //     euint64 inc = FHE.select(
        //         isMatch,
        //         FHE.asEuint64(1),
        //         FHE.asEuint64(0)
        //     );
        //     frequencyCounts[_qIdx][i] = FHE.add(frequencyCounts[_qIdx][i], inc);
        //     FHE.allowThis(frequencyCounts[_qIdx][i]); // allow contract to read new value
        // }
    }

    /**
     * @custom:since 0.1.0
     * @dev Initializes encrypted statistics for a new respondent
     * @param _addr Address of the respondent
     * @notice Sets up encrypted counters with initial values and grants ACL permissions
     * @notice minScore is initialized to 255 (max uint8) so first response wins
     */
    function _initializeRespondentStatistics(address _addr) internal {
        RespondentStats storage rs = respondentStatistics[_addr];

        rs.total = FHE.asEuint64(0);
        rs.sumSquares = FHE.asEuint64(0);
        rs.minScore = FHE.asEuint8(255);
        rs.maxScore = FHE.asEuint8(0);

        // Grant contract permanent ACL on all encrypted fields.
        FHE.allowThis(rs.total);
        FHE.allowThis(rs.sumSquares);
        FHE.allowThis(rs.minScore);
        FHE.allowThis(rs.maxScore);
    }

    /**
     * @custom:since 0.1.0
     * @dev Updates encrypted statistics for a respondent when they submit a new answer
     * @param _addr Address of the respondent
     * @param _resp Encrypted response value (euint8)
     * @notice Updates the respondent's total, sum of squares, and min/max scores
     * @notice All operations maintain encryption to preserve respondent privacy
     */
    function _updateRespondentStatistics(address _addr, euint8 _resp) internal {
        RespondentStats storage rs = respondentStatistics[_addr];
        euint64 resp64 = FHE.asEuint64(_resp);
        FHE.allowThis(resp64); // allow contract to read this value

        rs.total = FHE.add(rs.total, resp64);
        rs.sumSquares = FHE.add(rs.sumSquares, FHE.mul(resp64, resp64));
        rs.minScore = FHE.select(
            FHE.lt(_resp, rs.minScore),
            _resp,
            rs.minScore
        );
        rs.maxScore = FHE.select(
            FHE.gt(_resp, rs.maxScore),
            _resp,
            rs.maxScore
        );

        FHE.allowThis(rs.total); // allow contract to read new value
        FHE.allowThis(rs.sumSquares); // allow contract to read new value
        FHE.allowThis(rs.minScore); // allow contract to read new value
        FHE.allowThis(rs.maxScore); // allow contract to read new value
    }

    /**
     * @custom:since 0.1.0
     * @dev Giving access to respondent's encrypted statistics
     * @param _addr Address of the respondent
     * @notice Allows the respondent to decrypt their own statistics
     */
    function _grantRespondentDecrypt(address _addr) internal {
        FHE.allow(respondentStatistics[_addr].total, _addr);
        FHE.allow(respondentStatistics[_addr].sumSquares, _addr);
        FHE.allow(respondentStatistics[_addr].minScore, _addr);
        FHE.allow(respondentStatistics[_addr].maxScore, _addr);
    }

    // -------------------------------------
    // Getters
    // -------------------------------------
    // TODO: Implement getters for encrypted statistics
}
