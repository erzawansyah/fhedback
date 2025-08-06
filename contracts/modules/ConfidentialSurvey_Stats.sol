// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialSurvey
 * @dev Extends SurveyManager to create a confidential survey with privacy-preserving features.
 * @author M.E.W (github: erzawansyah)
 */

/**
 * @title ConfidentialSurvey_Stats
 * @dev Handles fully‑homomorphic statistics for each survey question.
 *      Inherited by the main ConfidentialSurvey contract.
 */
contract ConfidentialSurvey_Stats is SepoliaConfig {
    // ------------------------------------------------------------------------
    // Structures & Storage
    // ------------------------------------------------------------------------
    struct QuestionStats {
        euint64 total; // Σ x
        euint64 sumSquares; // Σ x²
        euint8 minScore; // empirical min
        euint8 maxScore; // configured max (kept encrypted for ACL consistency)
        mapping(uint8 => euint64) frequency; // histogram: choice ➜ count
    }

    /// @notice question index ⇒ statistics
    mapping(uint256 => QuestionStats) internal questionStatistics;

    /// @notice plaintext max score per question (needed during updates)
    mapping(uint256 => uint8) internal maxScores;

    // ------------------------------------------------------------------------
    // Internal helpers (Statistical Functions for Owner)
    // ------------------------------------------------------------------------

    /**
     * @dev Initialise stats for a new question.
     * @param _questionIndex Index of the question.
     * @param _maxScore      Highest score respondent can choose (>1).
     */
    function _initializeQuestionStatistics(
        uint256 _questionIndex,
        uint8 _maxScore
    ) internal {
        require(_maxScore > 1, "Max score must be greater than 1");
        QuestionStats storage qs = questionStatistics[_questionIndex];

        qs.total = FHE.asEuint64(0);
        qs.sumSquares = FHE.asEuint64(0);
        qs.minScore = FHE.asEuint8(_maxScore); // start at max so first response replaces it
        qs.maxScore = FHE.asEuint8(_maxScore);

        // ACL – allow this contract to operate on the encrypted fields
        FHE.allowThis(qs.total);
        FHE.allowThis(qs.sumSquares);
        FHE.allowThis(qs.minScore);
        FHE.allowThis(qs.maxScore);

        for (uint8 i = 1; i <= _maxScore; i++) {
            qs.frequency[i] = FHE.asEuint64(0);
            FHE.allowThis(qs.frequency[i]);
        }

        // store plaintext max for later updates
        maxScores[_questionIndex] = _maxScore;
    }

    /**
     * @dev Update running stats with one encrypted response.
     * @param _questionIndex Index of the question.
     * @param _response      Encrypted response value (1 … max).
     */
    function _updateQuestionStatistics(
        uint256 _questionIndex,
        euint8 _response
    ) internal {
        QuestionStats storage qs = questionStatistics[_questionIndex];
        uint8 _maxScorePlain = maxScores[_questionIndex];
        euint64 resp64 = FHE.asEuint64(_response);

        // Σ x
        qs.total = FHE.add(qs.total, resp64);

        // Σ x²
        qs.sumSquares = FHE.add(qs.sumSquares, FHE.mul(resp64, resp64));

        // min / max update
        qs.minScore = FHE.select(
            FHE.lt(_response, qs.minScore),
            _response,
            qs.minScore
        );
        qs.maxScore = FHE.select(
            FHE.gt(_response, qs.maxScore),
            _response,
            qs.maxScore
        );

        // histogram – increment only the matching bucket
        for (uint8 i = 1; i <= _maxScorePlain; i++) {
            ebool isMatch = FHE.eq(_response, FHE.asEuint8(i));
            euint64 incOne = FHE.select(
                isMatch,
                FHE.asEuint64(1),
                FHE.asEuint64(0)
            );
            qs.frequency[i] = FHE.add(qs.frequency[i], incOne);
        }
    }

    // ------------------------------------------------------------------------
    // Statistical Functions for Respondent
    // ------------------------------------------------------------------------
    struct RespondentStats {
        euint64 total; // Σ x
        euint64 sumSquares; // Σ x²
        euint8 minScore; // empirical min
        euint8 maxScore; // configured max
    }

    /// @notice respondent address ⇒ statistics
    mapping(address => RespondentStats) internal respondentStatistics;

    /**
     * @dev Initialize stats for a new respondent.
     * @param _respondent Address of the respondent.
     */
    function _initializeRespondentStatistics(address _respondent) internal {
        RespondentStats storage rs = respondentStatistics[_respondent];

        rs.total = FHE.asEuint64(0);
        rs.sumSquares = FHE.asEuint64(0);
        rs.minScore = FHE.asEuint8(255); // start at max so first response replaces it
        rs.maxScore = FHE.asEuint8(0);

        // ACL – allow this contract to operate on the encrypted fields
        FHE.allowThis(rs.total);
        FHE.allowThis(rs.sumSquares);
        FHE.allowThis(rs.minScore);
        FHE.allowThis(rs.maxScore);
    }

    /**
     * @dev Update respondent stats with one encrypted response.
     * @param _respondent Address of the respondent.
     * @param _response   Encrypted response value (1 … max).
     */
    function _updateRespondentStatistics(
        address _respondent,
        euint8 _response
    ) internal {
        RespondentStats storage rs = respondentStatistics[_respondent];
        euint64 resp64 = FHE.asEuint64(_response);

        // Σ x
        rs.total = FHE.add(rs.total, resp64);

        // Σ x²
        rs.sumSquares = FHE.add(rs.sumSquares, FHE.mul(resp64, resp64));

        // min / max update
        rs.minScore = FHE.select(
            FHE.lt(_response, rs.minScore),
            _response,
            rs.minScore
        );
        rs.maxScore = FHE.select(
            FHE.gt(_response, rs.maxScore),
            _response,
            rs.maxScore
        );
    }
}
