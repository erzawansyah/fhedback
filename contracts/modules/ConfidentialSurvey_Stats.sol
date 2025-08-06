// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialSurvey_Stats
 * @dev Statistical helper module inherited by the main ConfidentialSurvey contract.
 *      Provides encrypted statistical operations for survey questions and respondent data.
 *      All state is kept encrypted and manipulated through FHE operators only to ensure privacy.
 * @author M.E.W (github: erzawansyah)
 */
contract ConfidentialSurvey_Stats is SepoliaConfig {
    // -------------------------------------
    // Constants
    // -------------------------------------
    /// @dev Maximum allowed score per question to keep gas costs bounded (1-10 range)
    uint8 internal constant MAX_SCORE_PER_QUESTION = 10; // gas‑safe upper bound

    // -------------------------------------
    // Structures
    // -------------------------------------
    /**
     * @dev Encrypted statistics for individual survey questions
     * @param total Sum of all responses for this question (Σ x)
     * @param sumSquares Sum of squares of all responses (Σ x²) - used for variance calculation
     * @param minScore Current minimum score observed (encrypted)
     * @param maxScore Maximum allowed score for this question (encrypted for ACL consistency)
     * @param frequency Mapping from answer value to count of that answer
     */
    struct QuestionStats {
        euint64 total; // Σ x
        euint64 sumSquares; // Σ x²
        euint8 minScore; // empirical minimum
        euint8 maxScore; // configured maximum (encrypted for ACL parity)
        mapping(uint8 => euint64) frequency; // answer → count
    }

    /**
     * @dev Encrypted statistics for individual respondents across all their answers
     * @param total Sum of all responses from this respondent
     * @param sumSquares Sum of squares of all responses from this respondent
     * @param minScore Minimum score given by this respondent
     * @param maxScore Maximum score given by this respondent
     */
    struct RespondentStats {
        euint64 total;
        euint64 sumSquares;
        euint8 minScore;
        euint8 maxScore;
    }

    // -------------------------------------
    // Storage
    // -------------------------------------
    /// @dev Encrypted statistical data for each question indexed by question number
    mapping(uint256 => QuestionStats) internal questionStatistics;

    /// @dev Plaintext maximum scores for each question (used for frequency mapping bounds)
    mapping(uint256 => uint8) internal maxScores; // plaintext helper

    /// @dev Encrypted statistical data for each respondent indexed by their address
    mapping(address => RespondentStats) internal respondentStatistics;

    // -------------------------------------
    // Internal Helpers
    // -------------------------------------
    /**
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
            qs.frequency[i] = FHE.asEuint64(0);
            FHE.allowThis(qs.frequency[i]);
        }

        maxScores[_questionIndex] = _max;
    }

    /**
     * @dev Updates encrypted statistics when a new response is submitted for a question
     * @param _qIdx Index of the question being answered
     * @param _resp Encrypted response value (euint8)
     * @notice Updates total, sum of squares, min/max, and frequency distribution
     * @notice All operations are performed on encrypted data to maintain privacy
     */
    function _updateQuestionStatistics(uint256 _qIdx, euint8 _resp) internal {
        QuestionStats storage qs = questionStatistics[_qIdx];
        uint8 maxPlain = maxScores[_qIdx];
        euint64 resp64 = FHE.asEuint64(_resp); // safe encrypted cast (8 → 64‑bit)

        qs.total = FHE.add(qs.total, resp64);
        qs.sumSquares = FHE.add(qs.sumSquares, FHE.mul(resp64, resp64));

        qs.minScore = FHE.select(
            FHE.lt(_resp, qs.minScore),
            _resp,
            qs.minScore
        );
        qs.maxScore = FHE.select(
            FHE.gt(_resp, qs.maxScore),
            _resp,
            qs.maxScore
        );

        // update histogram bucket
        for (uint8 i = 1; i <= maxPlain; ++i) {
            ebool isMatch = FHE.eq(_resp, FHE.asEuint8(i));
            euint64 inc = FHE.select(
                isMatch,
                FHE.asEuint64(1),
                FHE.asEuint64(0)
            );
            qs.frequency[i] = FHE.add(qs.frequency[i], inc);
        }
    }

    /**
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

        FHE.allowThis(rs.total);
        FHE.allowThis(rs.sumSquares);
        FHE.allowThis(rs.minScore);
        FHE.allowThis(rs.maxScore);
    }

    /**
     * @dev Updates encrypted statistics for a respondent when they submit a new answer
     * @param _addr Address of the respondent
     * @param _resp Encrypted response value (euint8)
     * @notice Updates the respondent's total, sum of squares, and min/max scores
     * @notice All operations maintain encryption to preserve respondent privacy
     */
    function _updateRespondentStatistics(address _addr, euint8 _resp) internal {
        RespondentStats storage rs = respondentStatistics[_addr];
        euint64 resp64 = FHE.asEuint64(_resp);

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
    }
}
