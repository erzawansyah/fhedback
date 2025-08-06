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
 * @dev Statistical helper inherited by the main contract. All state is kept
 *      encrypted and manipulated through FHE operators only.
 */
contract ConfidentialSurvey_Stats is SepoliaConfig {
    // ------------------------------ CONSTANTS ----------------------------- //
    uint8 internal constant MAX_SCORE_PER_QUESTION = 10; // gas‑safe upper bound

    // ------------------------------ STRUCTURES --------------------------- //
    struct QuestionStats {
        euint64 total; // Σ x
        euint64 sumSquares; // Σ x²
        euint8 minScore; // empirical minimum
        euint8 maxScore; // configured maximum (encrypted for ACL parity)
        mapping(uint8 => euint64) frequency; // answer → count
    }

    struct RespondentStats {
        euint64 total;
        euint64 sumSquares;
        euint8 minScore;
        euint8 maxScore;
    }

    // ------------------------------ STORAGE ------------------------------ //
    mapping(uint256 => QuestionStats) internal questionStatistics;
    mapping(uint256 => uint8) internal maxScores; // plaintext helper
    mapping(address => RespondentStats) internal respondentStatistics;

    // -------------------------- INTERNAL HELPERS ------------------------- //
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
