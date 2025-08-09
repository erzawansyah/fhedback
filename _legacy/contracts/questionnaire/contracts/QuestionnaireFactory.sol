// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./Questionnaire.sol";
import "./FHEQuestionnaire.sol";

/// @title QuestionnaireFactory (with pagination)
/// @notice Tracks every deployed Questionnaire, maps them to creators,
///         counts total questionnaires, and counts unique users.
contract QuestionnaireFactory {
    /// Type of questionnaire
    /// - Public: All results are visible to everyone
    /// - Private: Results are encrypted and only visible to the owner
    enum QuestionnaireType {
        Public,
        Private
    }

    /* -------------------------------------------------------------- */
    /* Storage                                                        */
    /* -------------------------------------------------------------- */
    /// Struct to store questionnaire details
    struct QuestionnaireDetails {
        address addr;
        QuestionnaireType qType;
        address owner;
        uint256 createdAt;
    }
    QuestionnaireDetails[] private questionnaires;
    /// Owner => array of index positions in `questionnaires`.
    mapping(address => uint256[]) private userQuestionnaireIds;
    /// Owner address has appeared at least once.
    mapping(address => bool) private isUserRegistered;
    /// Total number of distinct creators.
    uint256 public uniqueUserCount;
    /// Address => index in questionnaires array (for O(1) lookup)
    mapping(address => uint256) private questionnaireToIndex;
    /// Address => whether questionnaire exists
    mapping(address => bool) private questionnaireExists;

    /* -------------------------------------------------------------- */
    /* Custom Errors                                                 */
    /* -------------------------------------------------------------- */
    error InvalidQuestionnaireType();
    error QuestionnaireNotFound(address questionnaireAddr);
    error IndexOutOfBounds(uint256 index);
    error InvalidRange(uint256 startIndex, uint256 endIndex);

    /* -------------------------------------------------------------- */
    /* Events                                                         */
    /* -------------------------------------------------------------- */
    event QuestionnaireCreated(
        address indexed owner,
        address indexed questionnaire
    );

    /* -------------------------------------------------------------- */
    /* External functions                                             */
    /* -------------------------------------------------------------- */
    /// @dev Deploys a new Questionnaire (public/private) and updates indexes.
    function createQuestionnaire(
        QuestionnaireType qType,
        string memory _title,
        uint8 _scaleLimit,
        uint256 _questionLimit,
        uint256 _respondentLimit
    ) external returns (address questionnaireAddr) {
        if (qType == QuestionnaireType.Public) {
            Questionnaire questionnaire = new Questionnaire(
                msg.sender, // Owner is the creator
                _title,
                _scaleLimit,
                _questionLimit,
                _respondentLimit
            );
            questionnaireAddr = address(questionnaire);
        } else if (qType == QuestionnaireType.Private) {
            FHEQuestionnaire questionnaire = new FHEQuestionnaire(
                msg.sender, // Owner is the creator
                _title,
                _scaleLimit,
                _questionLimit,
                _respondentLimit
            );
            questionnaireAddr = address(questionnaire);
        } else {
            revert InvalidQuestionnaireType();
        }
        // 2. Track globally.
        questionnaires.push(
            QuestionnaireDetails({
                addr: questionnaireAddr,
                qType: qType,
                owner: msg.sender,
                createdAt: block.timestamp
            })
        );
        uint256 newIndex = questionnaires.length - 1;

        // Update mappings for O(1) access
        questionnaireToIndex[questionnaireAddr] = newIndex;
        questionnaireExists[questionnaireAddr] = true;

        // 3. Track per-user (by index to avoid duplicating addresses).
        userQuestionnaireIds[msg.sender].push(newIndex);
        // 4. Register unique user once.
        if (!isUserRegistered[msg.sender]) {
            isUserRegistered[msg.sender] = true;
            unchecked {
                ++uniqueUserCount;
            }
        }
        // 5. Emit event.
        emit QuestionnaireCreated(msg.sender, questionnaireAddr);
    }

    /* -------------------------------------------------------------- */
    /* View helpers with pagination                                   */
    /* -------------------------------------------------------------- */
    /// @dev Get all public questionnaires
    function getPublicQuestionnairesPaginated(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (
            address[] memory questionnaireList,
            uint256 totalCount,
            bool hasMore
        )
    {
        uint256 total = questionnaires.length;
        // Hitung total kuisioner publik
        uint256 count = 0;
        for (uint256 i = 0; i < total; ++i) {
            if (questionnaires[i].qType == QuestionnaireType.Public) {
                ++count;
            }
        }
        totalCount = count;
        if (offset >= totalCount) {
            return (new address[](0), totalCount, false);
        }
        uint256 remaining = totalCount - offset;
        uint256 returnCount = remaining > limit ? limit : remaining;
        questionnaireList = new address[](returnCount);
        uint256 idx = 0;
        uint256 found = 0;
        for (uint256 i = 0; i < total && found < offset + returnCount; ++i) {
            if (questionnaires[i].qType == QuestionnaireType.Public) {
                if (found >= offset && idx < returnCount) {
                    questionnaireList[idx++] = questionnaires[i].addr;
                }
                ++found;
            }
        }
        hasMore = offset + returnCount < totalCount;
    }

    /// @dev Get all private questionnaires
    function getPrivateQuestionnairesPaginated(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (
            address[] memory questionnaireList,
            uint256 totalCount,
            bool hasMore
        )
    {
        uint256 total = questionnaires.length;
        // Hitung total kuisioner privat
        uint256 count = 0;
        for (uint256 i = 0; i < total; ++i) {
            if (questionnaires[i].qType == QuestionnaireType.Private) {
                ++count;
            }
        }
        totalCount = count;
        if (offset >= totalCount) {
            return (new address[](0), totalCount, false);
        }
        uint256 remaining = totalCount - offset;
        uint256 returnCount = remaining > limit ? limit : remaining;
        questionnaireList = new address[](returnCount);
        uint256 idx = 0;
        uint256 found = 0;
        for (uint256 i = 0; i < total && found < offset + returnCount; ++i) {
            if (questionnaires[i].qType == QuestionnaireType.Private) {
                if (found >= offset && idx < returnCount) {
                    questionnaireList[idx++] = questionnaires[i].addr;
                }
                ++found;
            }
        }
        hasMore = offset + returnCount < totalCount;
    }

    /// @dev Get all questionnaires with pagination
    /// @param offset Start position (0-indexed)
    /// @param limit Maximum number of data returned
    /// @return questionnaireList Array of questionnaire addresses
    /// @return totalCount Total number of questionnaires
    /// @return hasMore Whether there is more data next
    function getQuestionnairesPaginated(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (
            address[] memory questionnaireList,
            uint256 totalCount,
            bool hasMore
        )
    {
        totalCount = questionnaires.length;

        // Validate offset
        if (offset >= totalCount) {
            return (new address[](0), totalCount, false);
        }

        // Calculate the number of data to be returned
        uint256 remaining = totalCount - offset;
        uint256 returnCount = remaining > limit ? limit : remaining;

        // Create result array
        questionnaireList = new address[](returnCount);
        for (uint256 i = 0; i < returnCount; ++i) {
            questionnaireList[i] = questionnaires[offset + i].addr;
        }

        // Check if there is more data next
        hasMore = offset + returnCount < totalCount;
    }

    /// @dev Get questionnaires by user with pagination
    /// @param owner Questionnaire owner's address
    /// @param offset Start position (0-indexed)
    /// @param limit Maximum number of data returned
    /// @return questionnaireList Array of questionnaire addresses
    /// @return totalCount Total number of questionnaires from that user
    /// @return hasMore Whether there is more data next
    function getQuestionnairesByUserPaginated(
        address owner,
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (
            address[] memory questionnaireList,
            uint256 totalCount,
            bool hasMore
        )
    {
        uint256[] storage idxList = userQuestionnaireIds[owner];
        totalCount = idxList.length;

        // Validate offset
        if (offset >= totalCount) {
            return (new address[](0), totalCount, false);
        }

        // Calculate the number of data to be returned
        uint256 remaining = totalCount - offset;
        uint256 returnCount = remaining > limit ? limit : remaining;

        // Create result array
        questionnaireList = new address[](returnCount);
        for (uint256 i = 0; i < returnCount; ++i) {
            questionnaireList[i] = questionnaires[idxList[offset + i]].addr;
        }

        // Check if there is more data next
        hasMore = offset + returnCount < totalCount;
    }

    /// @dev Get questionnaires in a certain range (alternative pagination)
    /// @param startIndex Start index (inclusive)
    /// @param endIndex End index (exclusive)
    /// @return questionnaireList Array of questionnaire addresses in that range
    function getQuestionnairesInRange(
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory questionnaireList) {
        if (startIndex >= endIndex) {
            revert InvalidRange(startIndex, endIndex);
        }
        if (startIndex >= questionnaires.length) {
            revert IndexOutOfBounds(startIndex);
        }

        // Limit endIndex so it does not exceed array length
        if (endIndex > questionnaires.length) {
            endIndex = questionnaires.length;
        }

        uint256 length = endIndex - startIndex;
        questionnaireList = new address[](length);

        for (uint256 i = 0; i < length; ++i) {
            questionnaireList[i] = questionnaires[startIndex + i].addr;
        }
    }

    /// @dev Get the latest questionnaires with a certain limit
    /// @param limit Maximum number of latest questionnaires returned
    /// @return questionnaireList Array of latest questionnaire addresses (from newest to oldest)
    function getLatestQuestionnaires(
        uint256 limit
    ) external view returns (address[] memory questionnaireList) {
        uint256 totalQuestionnaires = questionnaires.length;
        if (totalQuestionnaires == 0) {
            return new address[](0);
        }

        uint256 returnCount = totalQuestionnaires > limit
            ? limit
            : totalQuestionnaires;
        questionnaireList = new address[](returnCount);

        // Start from the latest questionnaire (last index)
        for (uint256 i = 0; i < returnCount; ++i) {
            questionnaireList[i] = questionnaires[totalQuestionnaires - 1 - i]
                .addr;
        }
    }

    /* -------------------------------------------------------------- */
    /* View helpers original (for backward compatibility)             */
    /* -------------------------------------------------------------- */

    /// Return every questionnaire ever created (off-chain callers only).
    /// @dev WARNING: This function can be expensive in gas if there are many questionnaires
    function getQuestionnaires() external view returns (address[] memory) {
        address[] memory list = new address[](questionnaires.length);
        for (uint256 i = 0; i < questionnaires.length; ++i) {
            list[i] = questionnaires[i].addr;
        }
        return list;
    }

    /// Return how many questionnaires exist in total.
    function getQuestionnaireCount() external view returns (uint256) {
        return questionnaires.length;
    }

    /// Return the list of questionnaires created by a particular user.
    /// @dev WARNING: This function can be expensive in gas if the user has many questionnaires
    function getQuestionnairesByUser(
        address owner
    ) external view returns (address[] memory) {
        uint256[] storage idxList = userQuestionnaireIds[owner];
        uint256 len = idxList.length;
        address[] memory list = new address[](len);
        for (uint256 i = 0; i < len; ++i) {
            list[i] = questionnaires[idxList[i]].addr;
        }
        return list;
    }

    /// @dev Get the number of questionnaires owned by a certain user
    function getQuestionnaireCountByUser(
        address owner
    ) external view returns (uint256) {
        return userQuestionnaireIds[owner].length;
    }

    /// @dev Check if a user is registered (has ever created a questionnaire)
    function isUserExists(address owner) external view returns (bool) {
        return isUserRegistered[owner];
    }

    /* -------------------------------------------------------------- */
    /* Questionnaire details access functions                        */
    /* -------------------------------------------------------------- */

    /// @dev Get questionnaire details by index
    function getQuestionnaireDetails(
        uint256 index
    )
        external
        view
        returns (
            address addr,
            QuestionnaireType qType,
            address owner,
            uint256 createdAt
        )
    {
        if (index >= questionnaires.length) {
            revert IndexOutOfBounds(index);
        }
        QuestionnaireDetails storage q = questionnaires[index];
        return (q.addr, q.qType, q.owner, q.createdAt);
    }

    /// @dev Get questionnaire type by address
    function getQuestionnaireType(
        address questionnaireAddr
    ) external view returns (QuestionnaireType) {
        if (!questionnaireExists[questionnaireAddr]) {
            revert QuestionnaireNotFound(questionnaireAddr);
        }
        uint256 index = questionnaireToIndex[questionnaireAddr];
        return questionnaires[index].qType;
    }

    /// @dev Get questionnaire creation time by address
    function getQuestionnaireCreatedAt(
        address questionnaireAddr
    ) external view returns (uint256) {
        if (!questionnaireExists[questionnaireAddr]) {
            revert QuestionnaireNotFound(questionnaireAddr);
        }
        uint256 index = questionnaireToIndex[questionnaireAddr];
        return questionnaires[index].createdAt;
    }

    /// @dev Get questionnaire owner by address
    function getQuestionnaireOwner(
        address questionnaireAddr
    ) external view returns (address) {
        if (!questionnaireExists[questionnaireAddr]) {
            revert QuestionnaireNotFound(questionnaireAddr);
        }
        uint256 index = questionnaireToIndex[questionnaireAddr];
        return questionnaires[index].owner;
    }

    /// @dev Check if a questionnaire exists
    function isQuestionnaireExists(
        address questionnaireAddr
    ) external view returns (bool) {
        return questionnaireExists[questionnaireAddr];
    }

    /// @dev Get all questionnaire details by address in one call
    function getQuestionnaireDetailsByAddress(
        address questionnaireAddr
    )
        external
        view
        returns (
            address addr,
            QuestionnaireType qType,
            address owner,
            uint256 createdAt
        )
    {
        if (!questionnaireExists[questionnaireAddr]) {
            revert QuestionnaireNotFound(questionnaireAddr);
        }
        uint256 index = questionnaireToIndex[questionnaireAddr];
        QuestionnaireDetails storage q = questionnaires[index];
        return (q.addr, q.qType, q.owner, q.createdAt);
    }
}
