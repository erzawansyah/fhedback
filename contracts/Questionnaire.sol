// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {QuestionnaireErrors as ERRORS} from "./modules/QuestionnaireErrors.sol";
import {QuestionnaireEvents as EVENTS} from "./modules/QuestionnaireEvents.sol";

/**
 * @title Questionnaire Smart Contract
 * @dev A decentralized questionnaire system for collecting and analyzing survey responses
 * @author Your Name
 * @notice This contract allows creating, managing, and collecting responses for questionnaires
 */
contract Questionnaire {
    // --- Constant Variables and Enum---

    /// @dev Maximum number of questions allowed per questionnaire
    uint256 private constant MAX_QUESTION_LIMIT = 20;

    /// @dev Enum representing the different states of a questionnaire lifecycle
    enum QuestionnaireStatus {
        Initialized, // Questionnaire created but no questions added yet
        Draft, // Questions added but not published
        Published, // Live and accepting responses
        Closed, // No longer accepting responses
        Trashed // Marked for deletion
    }

    // --- State Variables (Questionnaire Configuration)---

    /// @notice Title of the questionnaire
    string public title;

    /// @notice IPFS Content ID for additional metadata
    string public metadataCID;

    /// @notice Address of the questionnaire owner/creator
    address public owner;

    /// @notice Maximum rating scale (e.g., 1-5, 1-10)
    uint8 public scaleLimit;

    /// @notice Maximum number of questions allowed
    uint256 public questionLimit;

    /// @notice Maximum number of respondents allowed
    uint256 public respondentLimit;

    /// @notice Current status of the questionnaire
    QuestionnaireStatus public status;

    /// @notice Total number of questions currently in the questionnaire
    uint256 public totalQuestions;

    /// @notice Total number of respondents who have submitted responses
    uint256 public totalRespondents;

    /// @dev Mapping from question ID to question text
    mapping(uint256 => string) public questions;

    // --- State Variables (Respondent action)---

    /// @dev Mapping to track which addresses have already responded
    mapping(address => bool) public hasResponded;

    /// @dev Mapping from respondent address to question ID to their response
    mapping(address => mapping(uint256 => uint8)) public responses;

    // --- State Variables (Statistical Requirements per Question)---

    /// @dev Statistical data: total score sum for each question
    mapping(uint256 => uint256) public questionTotalScore;

    /// @dev Statistical data: sum of squares for each question (for standard deviation)
    mapping(uint256 => uint256) public questionSumSquares;

    /// @dev Statistical data: minimum score received for each question
    mapping(uint256 => uint8) public questionMinScore;

    /// @dev Statistical data: maximum score received for each question
    mapping(uint256 => uint8) public questionMaxScore;

    // --- State Variables (Statistical Requirements per Respondent)---

    /// @dev Statistical data: total score for respondent for this questionnaire
    mapping(address => uint256) public respondentTotalScore;

    /// @dev Statistical data: sum of squares for each respondent total score (for standar deviation)
    mapping(address => uint256) public respondentSumSquares;

    /// @dev Statistical data: minimum score submitted for each respondent
    mapping(address => uint8) public respondentMinScore;

    /// @dev Statistical data: maximum score submitted for each respondent
    mapping(address => uint8) public respondentMaxScore;

    // --- Modifiers ---

    /**
     * @dev Ensures that the function can only be executed by the contract owner
     */
    modifier onlyOwner() {
        if (msg.sender != owner) revert ERRORS.OnlyOwner();
        _;
    }

    /**
     * @dev Ensures that the function can only be executed when questionnaire status is Initialized
     */
    modifier onlyInitialized() {
        if (status != QuestionnaireStatus.Initialized) {
            revert ERRORS.StatusNotInitialized();
        }
        _;
    }

    /**
     * @dev Ensures that the function can only be executed when questionnaire status is Draft
     */
    modifier onlyDraft() {
        if (status != QuestionnaireStatus.Draft) {
            revert ERRORS.StatusNotDraft();
        }
        _;
    }

    /**
     * @dev Ensures that the function can only be executed when questionnaire status is Published
     */
    modifier onlyPublished() {
        if (status != QuestionnaireStatus.Published) {
            revert ERRORS.StatusNotPublished();
        }
        _;
    }

    /**
     * @dev Ensures that the function can only be executed when questionnaire status is Closed
     */
    modifier onlyClosed() {
        if (status != QuestionnaireStatus.Closed) {
            revert ERRORS.StatusNotClosed();
        }
        _;
    }

    /**
     * @dev Ensures that the questionnaire is not in trash status
     */
    modifier notInTrash() {
        if (status == QuestionnaireStatus.Trashed) {
            revert ERRORS.QuestionnaireAlreadyDeleted();
        }
        _;
    }

    /**
     * @dev Ensures that the questionnaire is not closed
     */
    modifier notClosed() {
        if (status == QuestionnaireStatus.Closed) {
            revert ERRORS.QuestionnaireHasClosed();
        }
        _;
    }

    /**
     * @dev Ensures that the questionnaire can be deleted (only in Initialized or Draft state)
     */
    modifier canDelete() {
        if (
            status != QuestionnaireStatus.Initialized &&
            status != QuestionnaireStatus.Draft
        ) {
            revert ERRORS.CannotBeDeleted();
        }
        _;
    }

    // --- Constructor ---

    /**
     * @notice Creates a new questionnaire with specified parameters
     * @param _title The title of the questionnaire (cannot be empty)
     * @param _scaleLimit The maximum rating scale (2-10)
     * @param _questionLimit The maximum number of questions (1-20)
     * @param _respondentLimit The maximum number of respondents (must be > 0)
     */
    constructor(
        address _owner,
        string memory _title,
        uint8 _scaleLimit,
        uint256 _questionLimit,
        uint256 _respondentLimit
    ) {
        // Validate that owner address is not zero
        if (_owner == address(0)) revert ERRORS.InvalidOwnerAddress();

        // Validate that title is not empty
        if (bytes(_title).length == 0) revert ERRORS.InvalidTitle();

        // Validate scale limit is within acceptable range (2-10)
        if (_scaleLimit < 2 || _scaleLimit > 10) revert ERRORS.InvalidScale();

        // Validate question limit is within bounds (1-20)
        if (_questionLimit == 0 || _questionLimit > MAX_QUESTION_LIMIT)
            revert ERRORS.InvalidQuestionLimit();

        // Validate respondent limit is not zero
        if (_respondentLimit == 0) revert ERRORS.InvalidRespondentLimit();

        // Initialize contract state
        owner = _owner;
        title = _title;
        scaleLimit = _scaleLimit;
        questionLimit = _questionLimit;
        respondentLimit = _respondentLimit;
        status = QuestionnaireStatus.Initialized;

        // Emit creation event
        emit EVENTS.QuestionnaireCreated(
            owner,
            block.timestamp,
            _title,
            _scaleLimit,
            _questionLimit,
            _respondentLimit
        );
    }

    // --- Metadata Management ---

    /**
     * @notice Sets the IPFS metadata CID for the questionnaire
     * @dev Can only be called by owner when questionnaire is in Initialized state
     * @param _metadataCID The IPFS Content ID containing additional metadata
     */
    function setMetadata(
        string calldata _metadataCID
    ) external onlyOwner onlyInitialized {
        if (bytes(_metadataCID).length == 0) {
            revert ERRORS.QuestionnaireMetadataCIDEmpty();
        }
        metadataCID = _metadataCID;

        emit EVENTS.MetadataUpdated(_metadataCID);
    }

    // --- Questionnaire Management ---

    /**
     * @dev Internal function to add a single question to the questionnaire
     * @param _question The question text to add
     */
    function addQuestion(string calldata _question) internal {
        // Validate question is not empty
        if (bytes(_question).length == 0) revert ERRORS.EmptyQuestion();

        // Check if question limit has been reached
        if (totalQuestions >= questionLimit)
            revert ERRORS.MaxQuestionsReached();

        // Increment total questions and assign ID
        totalQuestions++;
        uint256 questionId = totalQuestions;
        questions[questionId] = _question;

        // Initialize statistical tracking for this question
        questionMinScore[questionId] = scaleLimit; // Set to max initially
        questionMaxScore[questionId] = 0; // Set to min initially

        emit EVENTS.QuestionAdded(questionId, _question);
    }

    /**
     * @notice Adds multiple questions to the questionnaire and changes status to Draft
     * @dev Can only be called by owner when questionnaire is in Initialized state
     * @param _questions Array of question strings to add
     */
    function addQuestions(
        string[] calldata _questions
    ) external onlyOwner onlyInitialized {
        // Add each question in the array
        for (uint256 i = 0; i < _questions.length; i++) {
            addQuestion(_questions[i]);
        }
        // Change status to Draft after adding questions
        status = QuestionnaireStatus.Draft;
    }

    /**
     * @notice Publishes the questionnaire, making it available for responses
     * @dev Can only be called by owner when questionnaire is in Draft state
     */
    function publish() external onlyOwner onlyDraft {
        // Ensure questionnaire has at least one question
        if (totalQuestions == 0) revert ERRORS.MustHaveQuestions();

        status = QuestionnaireStatus.Published;
        emit EVENTS.QuestionnairePublished(block.timestamp);
    }

    /**
     * @notice Closes the questionnaire, stopping new responses
     * @dev Can only be called by owner when questionnaire is Published
     */
    function closeQuestionnaire() external onlyOwner onlyPublished {
        status = QuestionnaireStatus.Closed;
        emit EVENTS.QuestionnaireClosed(block.timestamp);
    }

    /**
     * @notice Marks the questionnaire for deletion
     * @dev Can only be called by owner when questionnaire is in Initialized or Draft state
     */
    function deleteQuestionnaire() external onlyOwner canDelete {
        status = QuestionnaireStatus.Trashed;
        emit EVENTS.QuestionnaireDeleted(block.timestamp);
    }

    // --- Respondent Actions ---

    /**
     * @notice Submits responses to the questionnaire
     * @dev Can only be called when questionnaire is Published and by users who haven't responded
     * @param _responses Array of responses corresponding to each question (1 to scaleLimit)
     */
    function submitResponses(
        uint8[] calldata _responses
    ) external onlyPublished {
        // Owner can't submit their responded
        if (msg.sender == owner) revert ERRORS.NotForOwner();

        // Check if user has already responded
        if (hasResponded[msg.sender]) revert ERRORS.AlreadyResponded();

        // Validate response count matches question count
        if (_responses.length != totalQuestions)
            revert ERRORS.ResponseCountMismatch();

        // Check if respondent limit has been reached
        if (totalRespondents >= respondentLimit)
            revert ERRORS.RespondentLimitReached();

        uint256 iTotalScore = 0;
        uint256 iSumSquares = 0;
        uint8 iMinScore = scaleLimit;
        uint8 iMaxScore = 0;

        // Process each response
        for (uint256 i = 0; i < _responses.length; i++) {
            uint8 response = _responses[i];

            // Validate response is within scale range
            if (response < 1 || response > scaleLimit)
                revert ERRORS.ResponseOutOfRange();

            iTotalScore += response;
            iSumSquares += uint256(response) * uint256(response);
            if (response < iMinScore) iMinScore = response;
            if (response > iMaxScore) iMaxScore = response;

            uint256 questionId = i + 1;

            // Store the response
            responses[msg.sender][questionId] = response;

            // Update statistical data
            questionTotalScore[questionId] += response;
            questionSumSquares[questionId] += uint256(response) * response;

            // Update min/max scores
            if (response < questionMinScore[questionId]) {
                questionMinScore[questionId] = response;
            }
            if (response > questionMaxScore[questionId]) {
                questionMaxScore[questionId] = response;
            }
        }

        // Saving individual score
        // Setelah loop, update mapping respondent
        respondentTotalScore[msg.sender] = iTotalScore;
        respondentSumSquares[msg.sender] = iSumSquares;
        respondentMinScore[msg.sender] = iMinScore;
        respondentMaxScore[msg.sender] = iMaxScore;

        // Mark user as having responded and increment total
        hasResponded[msg.sender] = true;
        totalRespondents++;

        emit EVENTS.ResponseSubmitted(msg.sender, block.timestamp);

        // Auto-close if respondent limit is reached
        if (totalRespondents >= respondentLimit) {
            status = QuestionnaireStatus.Closed;
            emit EVENTS.QuestionnaireClosed(block.timestamp);
        }
    }

    // --- Query Functions ---

    /**
     * @notice Returns all questions in the questionnaire
     * @return Array of question strings
     */
    function getAllQuestions() external view returns (string[] memory) {
        string[] memory result = new string[](totalQuestions);
        for (uint256 i = 1; i <= totalQuestions; i++) {
            result[i - 1] = questions[i];
        }
        return result;
    }

    /**
     * @notice Returns all responses submitted by a specific user
     * @param user The address of the user whose responses to retrieve
     * @return Array of response values
     */
    function getUserResponses(
        address user
    ) external view returns (uint8[] memory) {
        if (!hasResponded[user]) revert ERRORS.UserHasNotResponded();

        uint8[] memory userRes = new uint8[](totalQuestions);
        for (uint256 i = 1; i <= totalQuestions; i++) {
            userRes[i - 1] = responses[user][i];
        }
        return userRes;
    }

    // --- Statistical Query Functions ---

    /**
     * @notice Mengambil statistik detail untuk responden tertentu dalam kuisioner ini, termasuk rata-rata skor.
     * @param respondent Alamat wallet responden yang ingin diambil statistiknya.
     * @return totalScore Total skor yang dikumpulkan oleh responden di seluruh pertanyaan.
     * @return sumSquares Jumlah kuadrat dari skor responden (untuk perhitungan standar deviasi).
     * @return minScore Skor minimum yang diberikan responden pada pertanyaan manapun.
     * @return maxScore Skor maksimum yang diberikan responden pada pertanyaan manapun.
     * @return averageScore Rata-rata skor yang diberikan responden (0 jika belum ada pertanyaan).
     */
    function getRespondentStatistics(
        address respondent
    )
        external
        view
        returns (
            uint256 totalScore,
            uint256 sumSquares,
            uint8 minScore,
            uint8 maxScore,
            uint256 averageScore
        )
    {
        if (!hasResponded[respondent]) revert ERRORS.UserHasNotResponded();

        uint256 _totalScore = respondentTotalScore[respondent];
        uint256 _totalQuestions = totalQuestions;
        uint256 _averageScore = _totalQuestions > 0
            ? toWad(_totalScore) / _totalQuestions
            : 0;

        return (
            _totalScore,
            respondentSumSquares[respondent],
            respondentMinScore[respondent],
            respondentMaxScore[respondent],
            _averageScore
        );
    }

    /**
     * @notice Calculates the average score for a specific question
     * @param questionId The ID of the question (1-based indexing)
     * @return The average score as a uint256
     */
    function getQuestionAverage(
        uint256 questionId
    ) external view returns (uint256) {
        if (questionId == 0 || questionId > totalQuestions)
            revert ERRORS.InvalidQuestionId();
        if (totalRespondents == 0) return 0;
        return toWad(questionTotalScore[questionId]) / totalRespondents;
    }

    /**
     * @notice Returns the minimum score received for a specific question
     * @param questionId The ID of the question (1-based indexing)
     * @return The minimum score as a uint8
     */
    function getQuestionMin(uint256 questionId) external view returns (uint8) {
        if (questionId == 0 || questionId > totalQuestions)
            revert ERRORS.InvalidQuestionId();
        if (totalRespondents == 0) return 0;
        return questionMinScore[questionId];
    }

    /**
     * @notice Returns the maximum score received for a specific question
     * @param questionId The ID of the question (1-based indexing)
     * @return The maximum score as a uint8
     */
    function getQuestionMax(uint256 questionId) external view returns (uint8) {
        if (questionId == 0 || questionId > totalQuestions)
            revert ERRORS.InvalidQuestionId();
        if (totalRespondents == 0) return 0;
        return questionMaxScore[questionId];
    }

    /**
     * @notice Calculates the standard deviation for a specific question
     * @dev Uses the formula: sqrt(mean of squares - square of mean)
     * @param questionId The ID of the question (1-based indexing)
     * @return The standard deviation as a uint256
     */
    function getQuestionStandardDeviation(
        uint256 questionId
    ) external view returns (uint256) {
        if (questionId == 0 || questionId > totalQuestions)
            revert ERRORS.InvalidQuestionId();
        if (totalRespondents == 0) return 0;

        // Calculate mean and mean of squares
        uint256 mean = toWad(questionTotalScore[questionId]) / totalRespondents;
        uint256 meanSquare = toWad(questionSumSquares[questionId]) /
            totalRespondents;

        // Calculate variance (mean of squares - square of mean)
        uint256 variance = meanSquare > (mean * mean) / 1e18
            ? meanSquare - (mean * mean) / 1e18
            : 0;

        return sqrt(variance);
    }

    /**
     * @notice Returns the current status of the questionnaire
     * @return currentStatus The current QuestionnaireStatus enum value
     */
    function getStatus()
        external
        view
        returns (QuestionnaireStatus currentStatus)
    {
        return status;
    }

    /**
     * @notice Returns general statistics about the questionnaire
     * @return respondents Total number of respondents
     * @return questionsCount Total number of questions
     * @return slotsRemaining Number of response slots remaining
     */
    function getQuestionnaireStatistics()
        external
        view
        returns (
            uint256 respondents,
            uint256 questionsCount,
            uint256 slotsRemaining
        )
    {
        return (
            totalRespondents,
            totalQuestions,
            respondentLimit > totalRespondents
                ? respondentLimit - totalRespondents
                : 0
        );
    }

    // --- Internal Helper Functions ---

    /**
     * @dev Helper untuk mengalikan value dengan 1e18 (fixed-point)
     */
    function toWad(uint256 value) internal pure returns (uint256) {
        return value * 1e18;
    }

    /**
     * @dev Calculates the square root of a number using the Babylonian method
     * @param x The number to find the square root of
     * @return y The square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
