import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialSurvey_Factory } from "../types/ConfidentialSurvey_Factory";
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";

/**
 * Test Suite: Others User Flow
 *
 * This test suite covers scenarios from the perspective of visitors, third parties,
 * and edge cases that don't fit creator or respondent flows.
 */
describe("Others User Flow", function () {
  let factory: ConfidentialSurvey_Factory;
  let surveyContract: ConfidentialSurvey;
  let creator: HardhatEthersSigner;
  let respondent: HardhatEthersSigner;
  let visitor: HardhatEthersSigner;
  let attacker: HardhatEthersSigner;

  const SURVEY_CONFIG = {
    SYMBOL: "PUBLIC",
    METADATA: "QmMetadata123",
    QUESTIONS: "QmQuestions456",
    TOTAL_QUESTIONS: 3,
    MAX_RESPONDENTS: 5,
    MAX_SCORES: [5, 10, 3],
  };

  beforeEach(async function () {
    [creator, respondent, visitor, attacker] = await ethers.getSigners();

    // Deploy factory
    const FactoryContract = await ethers.getContractFactory(
      "ConfidentialSurvey_Factory",
    );
    const factoryInstance = await FactoryContract.deploy(creator.address);
    await factoryInstance.waitForDeployment();
    factory = factoryInstance as unknown as ConfidentialSurvey_Factory;

    // Create and publish survey
    await factory
      .connect(creator)
      .createSurvey(
        creator.address,
        SURVEY_CONFIG.SYMBOL,
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

    const surveyAddress = await factory.getSurveyAddress(0);
    surveyContract = (await ethers.getContractAt(
      "ConfidentialSurvey",
      surveyAddress,
    )) as unknown as ConfidentialSurvey;

    // Publish survey to make it active
    await surveyContract
      .connect(creator)
      .publishSurvey(SURVEY_CONFIG.MAX_SCORES);
  });

  describe("As a Visitor, I can view public survey information", function () {
    it("As a Visitor, I can view basic survey details", async function () {
      const survey = await surveyContract.connect(visitor).survey();

      expect(survey.owner).to.equal(creator.address);
      expect(survey.symbol).to.equal(SURVEY_CONFIG.SYMBOL);
      expect(survey.metadataCID).to.equal(SURVEY_CONFIG.METADATA);
      expect(survey.questionsCID).to.equal(SURVEY_CONFIG.QUESTIONS);
      expect(survey.totalQuestions).to.equal(SURVEY_CONFIG.TOTAL_QUESTIONS);
      expect(survey.respondentLimit).to.equal(SURVEY_CONFIG.MAX_RESPONDENTS);
      expect(survey.status).to.equal(1); // Active
    });

    it("As a Visitor, I can check survey status", async function () {
      expect(await surveyContract.connect(visitor).getSurveyStatus()).to.equal(
        1,
      );
      expect(await surveyContract.connect(visitor).isActive()).to.be.true;
      expect(await surveyContract.connect(visitor).isClosed()).to.be.false;
      expect(await surveyContract.connect(visitor).isTrashed()).to.be.false;
    });

    it("As a Visitor, I can view survey progress statistics", async function () {
      expect(
        await surveyContract.connect(visitor).getTotalRespondents(),
      ).to.equal(0);
      expect(await surveyContract.connect(visitor).getProgress()).to.equal(0);
      expect(
        await surveyContract.connect(visitor).getRemainingSlots(),
      ).to.equal(SURVEY_CONFIG.MAX_RESPONDENTS);
      expect(await surveyContract.connect(visitor).hasReachedLimit()).to.be
        .false;
    });

    it("As a Visitor, I can access factory information", async function () {
      expect(await factory.connect(visitor).totalSurveys()).to.equal(1);
      expect(await factory.connect(visitor).getSurveyAddress(0)).to.equal(
        await surveyContract.getAddress(),
      );
      expect(
        await factory
          .connect(visitor)
          .getSurveyId(await surveyContract.getAddress()),
      ).to.equal(0);
    });

    it("As a Visitor, I can browse all surveys", async function () {
      // Create more surveys
      await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          "SURV2",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          "SURV3",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      expect(await factory.connect(visitor).totalSurveys()).to.equal(3);

      // Can access any survey address
      const survey2Address = await factory.connect(visitor).getSurveyAddress(1);
      const survey3Address = await factory.connect(visitor).getSurveyAddress(2);

      expect(survey2Address).to.not.equal(ethers.ZeroAddress);
      expect(survey3Address).to.not.equal(ethers.ZeroAddress);
      expect(survey2Address).to.not.equal(survey3Address);
    });
  });

  describe("As a Visitor, I cannot access restricted functions", function () {
    it("As a Visitor, I cannot manage survey lifecycle", async function () {
      // Cannot update metadata
      await expect(
        surveyContract.connect(visitor).updateSurveyMetadata("QmHacked"),
      ).to.be.revertedWith("not owner");

      // Cannot update questions
      await expect(
        surveyContract.connect(visitor).updateQuestions("QmHacked", 5),
      ).to.be.revertedWith("not owner");

      // Cannot close survey
      await expect(
        surveyContract.connect(visitor).closeSurvey(),
      ).to.be.revertedWith("not owner");

      // Cannot delete survey
      await expect(
        surveyContract.connect(visitor).deleteSurvey(),
      ).to.be.revertedWith("not owner");
    });

    it("As a Visitor, I cannot access decryption functions", async function () {
      // Submit a response first (to have encrypted data)
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      // Close survey first
      await surveyContract.connect(creator).closeSurvey();

      // Visitor cannot grant decryption access
      await expect(
        surveyContract.connect(visitor).grantOwnerDecrypt(0),
      ).to.be.revertedWith("not owner");
    });

    it("As a Visitor, I can create my own surveys", async function () {
      // Visitors should be able to create surveys
      await expect(
        factory
          .connect(visitor)
          .createSurvey(
            visitor.address,
            "VISITOR",
            SURVEY_CONFIG.METADATA,
            SURVEY_CONFIG.QUESTIONS,
            SURVEY_CONFIG.TOTAL_QUESTIONS,
            SURVEY_CONFIG.MAX_RESPONDENTS,
          ),
      ).to.not.be.reverted;

      expect(await factory.totalSurveys()).to.equal(2);
      expect(await factory.getSurveyCountByOwner(visitor.address)).to.equal(1);
    });
  });

  describe("As an Attacker, I cannot exploit the system", function () {
    it("As an Attacker, I cannot access others' encrypted responses", async function () {
      // Submit a legitimate response first
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      // Attacker cannot impersonate respondent
      expect(
        await surveyContract
          .connect(attacker)
          .getHasResponded(attacker.address),
      ).to.be.false;
      expect(
        await surveyContract
          .connect(attacker)
          .getHasResponded(respondent.address),
      ).to.be.true;

      // Cannot access respondent list position that doesn't belong to attacker
      // (This is public information anyway, but testing access patterns)
      expect(
        await surveyContract.connect(attacker).getRespondentAt(0),
      ).to.equal(respondent.address);
    });

    it("As an Attacker, I cannot bypass response limits", async function () {
      // Submit response as respondent
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      // Attacker cannot submit response for same address again
      await expect(
        surveyContract
          .connect(respondent)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("already responded");
    });

    it("As an Attacker, I cannot manipulate factory state", async function () {
      const initialTotalSurveys = await factory.totalSurveys();

      // Try to create survey with invalid parameters
      await expect(
        factory
          .connect(attacker)
          .createSurvey(
            attacker.address,
            "",
            SURVEY_CONFIG.METADATA,
            SURVEY_CONFIG.QUESTIONS,
            SURVEY_CONFIG.TOTAL_QUESTIONS,
            SURVEY_CONFIG.MAX_RESPONDENTS,
          ),
      ).to.be.revertedWith("symbol length invalid");

      await expect(
        factory.connect(attacker).createSurvey(
          attacker.address,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          0,
          SURVEY_CONFIG.MAX_RESPONDENTS, // Invalid total questions
        ),
      ).to.be.revertedWith("totalQuestions out of range");

      // Factory state should remain unchanged
      expect(await factory.totalSurveys()).to.equal(initialTotalSurveys);
    });

    it("As an Attacker, I cannot submit malformed responses", async function () {
      // Empty responses array would fail at FHEVM level
      // Let's test with invalid proof format instead
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        attacker.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      // Submit with tampered handles (this would fail in actual FHEVM)
      const tamperedHandles = encryptedInput.handles.map(() =>
        ethers.hexlify(ethers.randomBytes(32)),
      );

      await expect(
        surveyContract
          .connect(attacker)
          .submitResponses(tamperedHandles, encryptedInput.inputProof),
      ).to.be.reverted; // Should fail at FHEVM verification level
    });
  });

  describe("As Anyone, I can observe system events", function () {
    it("As Anyone, I can monitor survey creation events", async function () {
      await expect(
        factory
          .connect(visitor)
          .createSurvey(
            visitor.address,
            "EVENT",
            SURVEY_CONFIG.METADATA,
            SURVEY_CONFIG.QUESTIONS,
            SURVEY_CONFIG.TOTAL_QUESTIONS,
            SURVEY_CONFIG.MAX_RESPONDENTS,
          ),
      )
        .to.emit(factory, "SurveyCreated")
        .withArgs(1, ethers.isAddress, visitor.address, "EVENT");
    });

    it("As Anyone, I can monitor response submission events", async function () {
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await expect(
        surveyContract
          .connect(respondent)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      )
        .to.emit(surveyContract, "ResponseSubmitted")
        .withArgs(respondent.address);
    });

    it("As Anyone, I can monitor survey lifecycle events", async function () {
      // Submit response to meet minimum requirement
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      // Close survey
      await expect(surveyContract.connect(creator).closeSurvey())
        .to.emit(surveyContract, "SurveyClosed")
        .withArgs(1);

      // Delete another survey
      await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          "DELETE",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      const deleteAddress = await factory.getSurveyAddress(1);
      const deleteSurvey = (await ethers.getContractAt(
        "ConfidentialSurvey",
        deleteAddress,
      )) as unknown as ConfidentialSurvey;

      await expect(deleteSurvey.connect(creator).deleteSurvey()).to.emit(
        deleteSurvey,
        "SurveyDeleted",
      );
    });
  });

  describe("As Anyone, I can handle edge cases", function () {
    it("As Anyone, I cannot access non-existent surveys", async function () {
      await expect(factory.getSurveyAddress(999)).to.be.revertedWith(
        "invalid survey id",
      );

      await expect(factory.getSurveyId(ethers.ZeroAddress)).to.be.revertedWith(
        "survey not found",
      );
    });

    it("As Anyone, I can handle empty factory state", async function () {
      // Deploy new empty factory
      const EmptyFactory = await ethers.getContractFactory(
        "ConfidentialSurvey_Factory",
      );
      const emptyFactory = await EmptyFactory.deploy(creator.address);
      await emptyFactory.waitForDeployment();

      expect(await emptyFactory.totalSurveys()).to.equal(0);
      expect(
        await emptyFactory.getSurveyCountByOwner(creator.address),
      ).to.equal(0);
      expect(
        await emptyFactory.getSurveyCountByOwner(visitor.address),
      ).to.equal(0);

      const emptySurveys = await emptyFactory.getSurveysByOwner(
        creator.address,
      );
      expect(emptySurveys.length).to.equal(0);
    });

    it("As Anyone, I can verify contract initialization", async function () {
      expect(await factory.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await surveyContract.getAddress()).to.not.equal(
        ethers.ZeroAddress,
      );

      // Survey should be properly initialized
      const survey = await surveyContract.survey();
      expect(survey.owner).to.not.equal(ethers.ZeroAddress);
      expect(survey.symbol).to.have.length.greaterThan(0);
      expect(survey.totalQuestions).to.be.greaterThan(0);
      expect(survey.respondentLimit).to.be.greaterThan(0);
    });

    it("As Anyone, I can verify gas costs are reasonable", async function () {
      // Create survey and check gas usage
      const tx = await factory
        .connect(visitor)
        .createSurvey(
          visitor.address,
          "GAS",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      const receipt = await tx.wait();
      expect(receipt?.gasUsed).to.be.lessThan(5000000); // Should use less than 5M gas

      // Response submission should also be reasonable
      const newSurveyAddress = await factory.getSurveyAddress(1);
      const newSurvey = (await ethers.getContractAt(
        "ConfidentialSurvey",
        newSurveyAddress,
      )) as unknown as ConfidentialSurvey;

      await newSurvey.connect(visitor).publishSurvey(SURVEY_CONFIG.MAX_SCORES);

      const buffer = fhevm.createEncryptedInput(
        await newSurvey.getAddress(),
        respondent.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      const responseTx = await newSurvey
        .connect(respondent)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      const responseReceipt = await responseTx.wait();
      expect(responseReceipt?.gasUsed).to.be.lessThan(1000000); // Should use less than 1M gas
    });
  });
});
