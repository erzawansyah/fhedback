// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialSurvey
 * @dev Extends SurveyManager to create a confidential survey with privacy-preserving features.
 * @author M.E.W (github: erzawansyah)
 */
contract ConfidentialSurvey_Stats is SepoliaConfig {
    // ------------------------------------------------------------------------
    // Owner Related Statistical Variables and Functions
    // ------------------------------------------------------------------------

    /// @dev Holds the survey statistics.
    struct QuestionScores {
        euint64 total; // Total scores for the question
        euint64 sumSquares; // Sum of squared scores for variance calculation
        euint8 minScore;
        euint8 maxScore; // Maximum score for the question
        euint64[] frequency; // Frequency of responses for the question
    }
    mapping(uint256 => QuestionScores) public questionStatistics; // Maps question index to its statistics

    /// @dev Initializes the survey statistics for a given question.
    /// @param _questionIndex Index of the question to initialize.
    /// @param _maxScore Maximum score for the question.
    /// @custom:when This function is called during the publishing of the survey.
    function initializeQuestionStatistics(
        uint256 _questionIndex,
        uint8 _maxScore
    ) internal {
        euint64[] memory frequency = new euint64[](_maxScore);
        for (uint256 i = 0; i < _maxScore; i++) {
            frequency[i] = FHE.asEuint64(0); // initialize frequency array
        }
        questionStatistics[_questionIndex] = QuestionScores({
            total: FHE.asEuint64(0),
            sumSquares: FHE.asEuint64(0),
            minScore: FHE.asEuint8(255),
            maxScore: FHE.asEuint8(0),
            frequency: frequency
        });

        // Allow contract to perform FHE operations on the statistics
        FHE.allowThis(questionStatistics[_questionIndex].total); // Allow FHE operations on total
        FHE.allowThis(questionStatistics[_questionIndex].sumSquares); // Allow FHE operations on sumSquares
        FHE.allowThis(questionStatistics[_questionIndex].minScore); // Allow FHE operations on minScore
        FHE.allowThis(questionStatistics[_questionIndex].maxScore); // Allow FHE operations on maxScore
        for (uint256 i = 0; i < _maxScore; i++) {
            FHE.allowThis(questionStatistics[_questionIndex].frequency[i]); // Allow FHE operations on frequency
        }
    }

    /**
     * Function to close the survey and prepare for statistics gathering.
     * @dev Updates the statistics for a question after the survey is closed.
     * @param _questionIndex Index of the question being updated.
     * @param _response The response given by the respondent.
     * @custom:when This function is called when a respondent submits their response.
     */
    function updateQuestionStatistics(
        uint256 _questionIndex,
        euint8 _response
    ) internal {
        QuestionScores memory currentStats = questionStatistics[_questionIndex];

        // Add response to total score
        currentStats.total = FHE.add(
            currentStats.total,
            FHE.asEuint64(_response)
        );
        // Add square of response to sum of squares
        currentStats.sumSquares = FHE.add(
            currentStats.sumSquares,
            FHE.mul(FHE.asEuint64(_response), FHE.asEuint64(_response))
        );
        // Update empirical min
        currentStats.minScore = FHE.select(
            FHE.lt(_response, currentStats.minScore),
            _response,
            currentStats.minScore
        );
        // Update empirical max
        currentStats.maxScore = FHE.select(
            FHE.gt(_response, currentStats.maxScore),
            _response,
            currentStats.maxScore
        );

        // Update frequency for this response
        for (uint256 i = 0; i < currentStats.frequency.length; i++) {
            euint8 score = FHE.asEuint8(uint8(i + 1));
            // If response == score, then increment frequency[i]
            ebool isMatch = FHE.eq(_response, score);
            currentStats.frequency[i] = FHE.add(
                currentStats.frequency[i],
                FHE.select(isMatch, FHE.asEuint64(1), FHE.asEuint64(0))
            );
        }
    }
}
