// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ConfidentialSurvey_Base} from "./modules/ConfidentialSurvey_Base.sol";

/**
 * @custom:since 0.1.0
 * @title ConfidentialSurvey_Direct
 * @dev A privacy-preserving survey system using Fully Homomorphic Encryption (FHE).
 *      This is the direct implementation that doesn't use beacon proxy or factory patterns.
 *      Allows surveys to be conducted with encrypted responses, enabling statistical analysis
 *      without revealing individual responses.
 * @author M.E.W (github: erzawansyah)
 * @notice This contract enables creation of confidential surveys where responses remain
 *         encrypted throughout the entire process, only revealing aggregated statistics
 *         to the survey owner after the survey is closed.
 * @notice This version is deployed directly without using proxy patterns, making it simpler
 *         but non-upgradeable.
 */
contract ConfidentialSurvey is ConfidentialSurvey_Base, ReentrancyGuard {
    // -------------------------------------
    // Constructor
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
    constructor(
        address _owner,
        string memory _symbol,
        string memory _metadataCID,
        string memory _questionsCID,
        uint256 _totalQuestions,
        uint256 _respondentLimit
    ) {
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

    // -------------------------------------
    // Survey Management (Survey Creation, Metadata, Questions, Publishing)
    // -------------------------------------

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

        // Initialize encrypted statistics for each question
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
            _updateQuestionStatistics(i, resp);
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
        // This is a trade-off between gas cost and frequency count accuracy.
        // ===
        uint8 maxPlain = maxScores[_qIdx];
        for (uint8 i = 1; i <= maxPlain; ++i) {
            ebool isMatch = FHE.eq(_resp, FHE.asEuint8(i));
            euint64 inc = FHE.select(
                isMatch,
                FHE.asEuint64(1),
                FHE.asEuint64(0)
            );
            frequencyCounts[_qIdx][i] = FHE.add(frequencyCounts[_qIdx][i], inc);
            FHE.allowThis(frequencyCounts[_qIdx][i]); // allow contract to read new value
        }
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

    /**
     * @custom:since 0.1.0
     * @dev Returns the complete survey details
     * @return SurveyDetails struct containing all survey metadata and configuration
     */
    function getSurvey() external view returns (SurveyDetails memory) {
        return survey;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the current survey status
     * @return Current status of the survey (Created, Active, Closed, Trashed)
     */
    function getSurveyStatus() external view returns (SurveyStatus) {
        return survey.status;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the survey owner address
     * @return Address of the survey owner
     */
    function getSurveyOwner() external view returns (address) {
        return survey.owner;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the total number of questions in the survey
     * @return Number of questions configured for this survey
     */
    function getTotalQuestions() external view returns (uint256) {
        return survey.totalQuestions;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the maximum number of respondents allowed
     * @return Maximum respondent limit for this survey
     */
    function getRespondentLimit() external view returns (uint256) {
        return survey.respondentLimit;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the current number of respondents who have submitted responses
     * @return Current count of respondents
     */
    function getTotalRespondents() external view returns (uint256) {
        return totalRespondents;
    }

    /**
     * @custom:since 0.1.0
     * @dev Checks if a specific address has already responded to the survey
     * @param _respondent Address to check
     * @return True if the address has already submitted responses, false otherwise
     */
    function getHasResponded(address _respondent) external view returns (bool) {
        return hasResponded[_respondent];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the address of a respondent at a specific index
     * @param _index Index of the respondent in the respondents array
     * @return Address of the respondent at the given index
     */
    function getRespondentAt(uint256 _index) external view returns (address) {
        require(_index < totalRespondents, "index out of bounds");
        return respondents[_index];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns all respondent addresses
     * @return Array of all respondent addresses
     * @notice This function may consume significant gas for surveys with many respondents
     */
    function getAllRespondents() external view returns (address[] memory) {
        address[] memory result = new address[](totalRespondents);
        for (uint256 i = 0; i < totalRespondents; i++) {
            result[i] = respondents[i];
        }
        return result;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the encrypted response for a specific respondent and question
     * @param _respondent Address of the respondent
     * @param _questionIndex Index of the question
     * @return Encrypted response (euint8)
     * @notice Only the respondent themselves can decrypt this value
     */
    function getRespondentResponse(
        address _respondent,
        uint256 _questionIndex
    ) external view returns (euint8) {
        require(
            _questionIndex < survey.totalQuestions,
            "invalid question index"
        );
        require(hasResponded[_respondent], "respondent has not responded");
        return responses[_respondent][_questionIndex];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns all encrypted responses for a specific respondent
     * @param _respondent Address of the respondent
     * @return Array of encrypted responses (euint8[])
     * @notice Only the respondent themselves can decrypt these values
     */
    function getRespondentResponses(
        address _respondent
    ) external view returns (euint8[] memory) {
        require(hasResponded[_respondent], "respondent has not responded");

        euint8[] memory userResponses = new euint8[](survey.totalQuestions);
        for (uint256 i = 0; i < survey.totalQuestions; i++) {
            userResponses[i] = responses[_respondent][i];
        }
        return userResponses;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns encrypted statistical data for a specific question
     * @param _questionIndex Index of the question
     * @return QuestionStats struct containing encrypted statistics
     * @notice Statistics can only be decrypted by the survey owner after the survey is closed
     */
    function getQuestionStatistics(
        uint256 _questionIndex
    ) external view returns (QuestionStats memory) {
        require(
            _questionIndex < survey.totalQuestions,
            "invalid question index"
        );
        return questionStatistics[_questionIndex];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns encrypted frequency count for a specific question and answer value
     * @param _questionIndex Index of the question
     * @param _answerValue The answer value to get frequency for
     * @return Encrypted frequency count (euint64)
     * @notice Can only be decrypted by the survey owner after the survey is closed
     */
    function getFrequencyCount(
        uint256 _questionIndex,
        uint8 _answerValue
    ) external view returns (euint64) {
        require(
            _questionIndex < survey.totalQuestions,
            "invalid question index"
        );
        require(
            _answerValue > 0 && _answerValue <= maxScores[_questionIndex],
            "invalid answer value"
        );
        return frequencyCounts[_questionIndex][_answerValue];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns all encrypted frequency counts for a specific question
     * @param _questionIndex Index of the question
     * @return Array of encrypted frequency counts for all possible answer values
     * @notice Can only be decrypted by the survey owner after the survey is closed
     */
    function getQuestionFrequencies(
        uint256 _questionIndex
    ) external view returns (euint64[] memory) {
        require(
            _questionIndex < survey.totalQuestions,
            "invalid question index"
        );

        uint8 maxScore = maxScores[_questionIndex];
        euint64[] memory frequencies = new euint64[](maxScore);

        for (uint8 i = 1; i <= maxScore; i++) {
            frequencies[i - 1] = frequencyCounts[_questionIndex][i];
        }

        return frequencies;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns the maximum allowed score for a specific question
     * @param _questionIndex Index of the question
     * @return Maximum score value for the question
     */
    function getMaxScore(uint256 _questionIndex) external view returns (uint8) {
        require(
            _questionIndex < survey.totalQuestions,
            "invalid question index"
        );
        return maxScores[_questionIndex];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns all maximum scores for all questions
     * @return Array of maximum scores for each question
     */
    function getAllMaxScores() external view returns (uint8[] memory) {
        uint8[] memory scores = new uint8[](survey.totalQuestions);
        for (uint256 i = 0; i < survey.totalQuestions; i++) {
            scores[i] = maxScores[i];
        }
        return scores;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns encrypted statistical data for a specific respondent
     * @param _respondent Address of the respondent
     * @return RespondentStats struct containing encrypted statistics
     * @notice Only the respondent themselves can decrypt these values
     */
    function getRespondentStatistics(
        address _respondent
    ) external view returns (RespondentStats memory) {
        require(hasResponded[_respondent], "respondent has not responded");
        return respondentStatistics[_respondent];
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns survey creation timestamp
     * @return Timestamp when the survey was created
     */
    function getCreatedAt() external view returns (uint256) {
        return survey.createdAt;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns survey metadata CID
     * @return IPFS CID containing survey metadata
     */
    function getMetadataCID() external view returns (string memory) {
        return survey.metadataCID;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns survey questions CID
     * @return IPFS CID containing survey questions
     */
    function getQuestionsCID() external view returns (string memory) {
        return survey.questionsCID;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns survey symbol
     * @return Symbol identifier for the survey
     */
    function getSurveySymbol() external view returns (string memory) {
        return survey.symbol;
    }

    /**
     * @custom:since 0.1.0
     * @dev Checks if the survey is currently accepting responses
     * @return True if survey is active and accepting responses
     */
    function isActive() external view returns (bool) {
        return survey.status == SurveyStatus.Active;
    }

    /**
     * @custom:since 0.1.0
     * @dev Checks if the survey is closed
     * @return True if survey is closed
     */
    function isClosed() external view returns (bool) {
        return survey.status == SurveyStatus.Closed;
    }

    /**
     * @custom:since 0.1.0
     * @dev Checks if the survey has been deleted/trashed
     * @return True if survey is trashed
     */
    function isTrashed() external view returns (bool) {
        return survey.status == SurveyStatus.Trashed;
    }

    /**
     * @custom:since 0.1.0
     * @dev Checks if the survey has reached its respondent limit
     * @return True if survey has reached maximum respondents
     */
    function hasReachedLimit() external view returns (bool) {
        return totalRespondents >= survey.respondentLimit;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns survey progress as percentage
     * @return Progress percentage (0-100)
     */
    function getProgress() external view returns (uint256) {
        if (survey.respondentLimit == 0) return 0;
        return (totalRespondents * 100) / survey.respondentLimit;
    }

    /**
     * @custom:since 0.1.0
     * @dev Returns remaining slots for respondents
     * @return Number of remaining respondent slots
     */
    function getRemainingSlots() external view returns (uint256) {
        if (totalRespondents >= survey.respondentLimit) return 0;
        return survey.respondentLimit - totalRespondents;
    }
}
