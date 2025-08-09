// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {ConfidentialSurvey_Storage} from "./ConfidentialSurvey_Storage.sol";

abstract contract ConfidentialSurvey_Base is ConfidentialSurvey_Storage {
    // -------------------------------------
    // Constants
    // -------------------------------------
    /// @custom:since 0.1.0
    /// @dev Maximum number of respondents allowed per survey (gas optimization limit)
    uint256 internal constant MAX_RESPONDENTS = 1000;

    /// @custom:since 0.1.0
    /// @dev Minimum number of respondents required to close the survey (1-1000)
    uint256 internal constant MIN_RESPONDENTS = 1;

    /// @custom:since 0.1.0
    /// @dev Maximum allowed score per question to keep gas costs bounded (1-10 range)
    uint8 internal constant MAX_SCORE_PER_QUESTION = 10; // gas‑safe upper bound

    /// @custom:since 0.1.0
    /// @dev Maximum question count for a survey (gas optimization limit)
    uint256 internal constant MAX_QUESTIONS = 15; // gas‑safe upper bound

    // -------------------------------------
    // Events
    // -------------------------------------
    /**
     * @dev Emitted when a new survey is created
     * @param owner Address of the survey creator
     * @param symbol Symbol for the survey (Required. Max 10 characters)
     * @param metadataCID IPFS CID containing survey metadata
     */
    event SurveyCreated(
        address indexed owner,
        string symbol,
        string metadataCID
    );

    /**
     * @dev Emitted when survey metadata is updated
     * @param cid New IPFS CID for the metadata
     */
    event SurveyMetadataUpdated(string cid);

    /**
     * @dev Emitted when survey questions are updated
     * @param totalQuestions New total number of questions
     */
    event SurveyQuestionsUpdated(uint256 totalQuestions);

    /**
     * @dev Emitted when survey is published and becomes active
     */
    event SurveyPublished();

    /**
     * @dev Emitted when survey is closed
     * @param totalRespondents Final number of respondents who participated
     */
    event SurveyClosed(uint256 totalRespondents);

    /**
     * @dev Emitted when survey is deleted/trashed
     */
    event SurveyDeleted();

    /**
     * @dev Emitted when a new response is submitted
     */
    event ResponsesSubmitted();

    // -------------------------------------
    // Modifiers
    // -------------------------------------
    /**
     * @dev Restricts function access to survey owner only
     */
    modifier onlyOwner() {
        require(msg.sender == survey.owner, "not owner");
        _;
    }

    /**
     * @dev Restricts function access by owner
     */
    modifier notOwner() {
        require(msg.sender != survey.owner, "owner not allowed");
        _;
    }

    /**
     * @dev Restricts function access to when survey is active
     */
    modifier onlyActive() {
        require(survey.status == SurveyStatus.Active, "not active");
        _;
    }

    /**
     * @dev Restricts function access to when survey is closed
     */
    modifier onlyClosed() {
        require(survey.status == SurveyStatus.Closed, "not closed");
        _;
    }

    /**
     * @dev Restricts function access when survey is not trashed
     */
    modifier notTrashed() {
        require(survey.status != SurveyStatus.Trashed, "trashed");
        _;
    }

    /**
     * @dev Restricts function access when survey is not active
     */
    modifier notActive() {
        require(survey.status != SurveyStatus.Active, "already active");
        _;
    }

    /**
     * @dev Restricts function access to when survey can be edited (Created state only)
     */
    modifier canEditOrDelete() {
        require(survey.status == SurveyStatus.Created, "immutable state");
        _;
    }

    /**
     * @dev Restricts function access to users who haven't responded yet
     */
    modifier notResponded() {
        require(!hasResponded[msg.sender], "already responded");
        _;
    }

    /**
     * @dev Restricts function access when metadata and questions are set
     */
    modifier metadataAndQuestionsSet() {
        require(
            survey.totalQuestions > 0 &&
                bytes(survey.metadataCID).length > 0 &&
                bytes(survey.questionsCID).length > 0,
            "metadata or questions not set"
        );
        _;
    }

    /// @dev Restricts if respondent limit is reached
    modifier limitNotReached() {
        require(totalRespondents < survey.respondentLimit, "limit reached");
        _;
    }

    /// @dev Restricts if minimum respondents not reached
    modifier minReached() {
        require(totalRespondents >= MIN_RESPONDENTS, "min not reached");
        _;
    }
}
