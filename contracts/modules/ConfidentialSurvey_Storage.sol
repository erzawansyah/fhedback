// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialSurvey_Storage is SepoliaConfig {
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
     * @param owner Address of the survey creator/owner
     * @param symbol Symbol for the survey (Required. Max 10 characters)
     * @param metadataCID IPFS CID containing survey metadata
     * @param questionsCID IPFS CID containing survey questions
     * @param totalQuestions Number of questions in the survey
     * @param createdAt Timestamp when survey was created
     * @param respondentLimit Maximum number of allowed respondents
     * @param status Current status of the survey
     */
    struct SurveyDetails {
        address owner;
        string symbol;
        string metadataCID;
        string questionsCID;
        uint256 totalQuestions;
        uint256 respondentLimit;
        uint256 createdAt;
        SurveyStatus status;
    }

    /**
     * @dev Encrypted statistics for individual survey questions
     * @param total Sum of all responses for this question (Σ x)
     * @param sumSquares Sum of squares of all responses (Σ x²) - used for variance calculation
     * @param minScore Current minimum score observed (encrypted)
     * @param maxScore Maximum allowed score for this question
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
    // Storage (State Variables)
    // -------------------------------------
    /// @notice Complete survey configuration and metadata
    SurveyDetails internal survey;

    /// @notice Current number of users who have submitted responses
    uint256 internal totalRespondents;

    /// @dev Tracks whether each address has already responded to prevent duplicate submissions
    mapping(address => bool) internal hasResponded;

    /// @dev Array of all respondent addresses for enumeration (limited to MAX_RESPONDENTS for gas efficiency)
    address[] internal respondents; // small (≤1000) –‑ enumeration acceptable

    /// @dev Encrypted responses: respondent address => question index => encrypted answer
    mapping(address => mapping(uint256 => euint8)) internal responses; // respondent ⇒ (qIdx ⇒ answer)

    // -------------------------------------
    // Statistics Storage
    // -------------------------------------
    /// @dev Encrypted statistical data for each question indexed by question number
    mapping(uint256 => QuestionStats) internal questionStatistics;

    /// @dev Plaintext maximum scores for each question (used for frequency mapping bounds)
    mapping(uint256 => uint8) internal maxScores; // plaintext helper

    /// @dev Encrypted statistical data for each respondent indexed by their address
    mapping(address => RespondentStats) internal respondentStatistics;
}
