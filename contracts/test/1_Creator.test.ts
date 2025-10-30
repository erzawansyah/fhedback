import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialSurvey_Factory } from "../types/ConfidentialSurvey_Factory";
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";

/**
 * Test Suite: Creator User Flow
 *
 * This test suite covers all scenarios from the perspective of a survey creator.
 * It tests the complete lifecycle from factory interaction to survey management.
 */
describe("Creator User Flow", function () {
  let factory: ConfidentialSurvey_Factory;
  let creator: HardhatEthersSigner;
  let anotherCreator: HardhatEthersSigner;
  let respondent1: HardhatEthersSigner;
  let respondent2: HardhatEthersSigner;

  const SURVEY_CONFIG = {
    SYMBOL: "TEST",
    METADATA: "QmMetadata123",
    QUESTIONS: "QmQuestions456",
    TOTAL_QUESTIONS: 3,
    MAX_RESPONDENTS: 5,
    MAX_SCORES: [5, 10, 3],
  };

  beforeEach(async function () {
    [creator, anotherCreator, respondent1, respondent2] =
      await ethers.getSigners();

    // Deploy factory
    const FactoryContract = await ethers.getContractFactory(
      "ConfidentialSurvey_Factory",
    );
    const factoryInstance = await FactoryContract.deploy(creator.address);
    await factoryInstance.waitForDeployment();
    factory = factoryInstance as unknown as ConfidentialSurvey_Factory;
  });

  describe("As a Creator, I can interact with Factory", function () {
    it("As a Creator, I can create a new survey", async function () {
      const tx = await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      await expect(tx)
        .to.emit(factory, "SurveyCreated")
        .withArgs(0, ethers.isAddress, creator.address, SURVEY_CONFIG.SYMBOL);

      expect(await factory.totalSurveys()).to.equal(1);
    });

    it("As a Creator, I can create multiple surveys", async function () {
      // Create first survey
      await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          "SURV1",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      // Create second survey
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

      expect(await factory.totalSurveys()).to.equal(2);
      expect(await factory.getSurveyCountByOwner(creator.address)).to.equal(2);
    });

    it("As a Creator, I can view all my surveys", async function () {
      // Create two surveys
      await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          "SURV1",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

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

      const mySurveys = await factory.getSurveysByOwner(creator.address);
      expect(mySurveys.length).to.equal(2);
      expect(mySurveys[0]).to.equal(0); // First survey ID
      expect(mySurveys[1]).to.equal(1); // Second survey ID
    });

    it("As a Creator, I can get survey addresses from the factory", async function () {
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
      expect(surveyAddress).to.not.equal(ethers.ZeroAddress);

      const surveyId = await factory.getSurveyId(surveyAddress);
      expect(surveyId).to.equal(0);
    });
  });

  describe("As a Creator, I can manage my survey", function () {
    let surveyContract: ConfidentialSurvey;
    let surveyAddress: string;

    beforeEach(async function () {
      // Create survey via factory
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

      surveyAddress = await factory.getSurveyAddress(0);
      surveyContract = (await ethers.getContractAt(
        "ConfidentialSurvey",
        surveyAddress,
      )) as unknown as ConfidentialSurvey;
    });

    it("As a Creator, I can view my survey details", async function () {
      const survey = await surveyContract.survey();

      expect(survey.owner).to.equal(creator.address);
      expect(survey.symbol).to.equal(SURVEY_CONFIG.SYMBOL);
      expect(survey.metadataCID).to.equal(SURVEY_CONFIG.METADATA);
      expect(survey.questionsCID).to.equal(SURVEY_CONFIG.QUESTIONS);
      expect(survey.totalQuestions).to.equal(SURVEY_CONFIG.TOTAL_QUESTIONS);
      expect(survey.respondentLimit).to.equal(SURVEY_CONFIG.MAX_RESPONDENTS);
      expect(survey.status).to.equal(0); // Created state
    });

    it("As a Creator, I can update survey metadata before publishing", async function () {
      const newMetadata = "QmNewMetadata789";

      await expect(
        surveyContract.connect(creator).updateSurveyMetadata(newMetadata),
      )
        .to.emit(surveyContract, "SurveyMetadataUpdated")
        .withArgs(newMetadata);

      const survey = await surveyContract.survey();
      expect(survey.metadataCID).to.equal(newMetadata);
    });

    it("As a Creator, I can update survey questions before publishing", async function () {
      const newQuestions = "QmNewQuestions999";
      const newTotalQuestions = 5;

      await expect(
        surveyContract
          .connect(creator)
          .updateQuestions(newQuestions, newTotalQuestions),
      )
        .to.emit(surveyContract, "SurveyQuestionsUpdated")
        .withArgs(newTotalQuestions);

      const survey = await surveyContract.survey();
      expect(survey.questionsCID).to.equal(newQuestions);
      expect(survey.totalQuestions).to.equal(newTotalQuestions);
    });

    it("As a Creator, I can publish my survey", async function () {
      await expect(
        surveyContract.connect(creator).publishSurvey(SURVEY_CONFIG.MAX_SCORES),
      ).to.emit(surveyContract, "SurveyPublished");

      expect(await surveyContract.getSurveyStatus()).to.equal(1); // Active state
      expect(await surveyContract.isActive()).to.be.true;
    });

    it("As a Creator, I cannot update metadata after publishing", async function () {
      // Publish survey first
      await surveyContract
        .connect(creator)
        .publishSurvey(SURVEY_CONFIG.MAX_SCORES);

      // Try to update metadata
      await expect(
        surveyContract.connect(creator).updateSurveyMetadata("QmNewMeta"),
      ).to.be.revertedWith("immutable state");
    });

    it("As a Creator, I can close my active survey", async function () {
      // Publish survey
      await surveyContract
        .connect(creator)
        .publishSurvey(SURVEY_CONFIG.MAX_SCORES);

      // Submit at least one response to meet minimum requirement
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer.add8(2).add8(3).add8(1); // Valid responses within max scores
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      // Close survey
      await expect(surveyContract.connect(creator).closeSurvey())
        .to.emit(surveyContract, "SurveyClosed")
        .withArgs(1);

      expect(await surveyContract.getSurveyStatus()).to.equal(2); // Closed state
      expect(await surveyContract.isClosed()).to.be.true;
    });

    it("As a Creator, I can delete my survey when not active", async function () {
      await expect(surveyContract.connect(creator).deleteSurvey()).to.emit(
        surveyContract,
        "SurveyDeleted",
      );

      expect(await surveyContract.getSurveyStatus()).to.equal(3); // Trashed state
      expect(await surveyContract.isTrashed()).to.be.true;
    });

    it("As a Creator, I cannot delete active survey", async function () {
      // Publish survey to make it active
      await surveyContract
        .connect(creator)
        .publishSurvey(SURVEY_CONFIG.MAX_SCORES);

      await expect(
        surveyContract.connect(creator).deleteSurvey(),
      ).to.be.revertedWith("already active");
    });
  });

  describe("As a Creator, I can access survey analytics", function () {
    let surveyContract: ConfidentialSurvey;

    beforeEach(async function () {
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

      await surveyContract
        .connect(creator)
        .publishSurvey(SURVEY_CONFIG.MAX_SCORES);
    });

    it("As a Creator, I can view survey progress", async function () {
      expect(await surveyContract.getTotalRespondents()).to.equal(0);
      expect(await surveyContract.getProgress()).to.equal(0);
      expect(await surveyContract.getRemainingSlots()).to.equal(
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );
      expect(await surveyContract.hasReachedLimit()).to.be.false;
    });

    it("As a Creator, I can see respondent participation", async function () {
      // Submit one response
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer.add8(2).add8(3).add8(1);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      expect(await surveyContract.getTotalRespondents()).to.equal(1);
      expect(await surveyContract.getHasResponded(respondent1.address)).to.be
        .true;
      expect(await surveyContract.getHasResponded(respondent2.address)).to.be
        .false;
      expect(await surveyContract.getRespondentAt(0)).to.equal(
        respondent1.address,
      );
    });

    it("As a Creator, I can grant myself decryption access after closing", async function () {
      // Submit responses and close survey
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer.add8(2).add8(3).add8(1);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      await surveyContract.connect(creator).closeSurvey();

      // Grant decryption access for question 0
      await expect(surveyContract.connect(creator).grantOwnerDecrypt(0)).to.not
        .be.reverted;
    });

    it("As a Creator, I cannot grant decryption access before closing", async function () {
      await expect(
        surveyContract.connect(creator).grantOwnerDecrypt(0),
      ).to.be.revertedWith("not closed");
    });
  });

  describe("As a Creator, I have ownership restrictions", function () {
    let surveyContract: ConfidentialSurvey;

    beforeEach(async function () {
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
    });

    it("As a Creator, only I can manage my survey", async function () {
      // Another user cannot update metadata
      await expect(
        surveyContract.connect(anotherCreator).updateSurveyMetadata("QmHacked"),
      ).to.be.revertedWith("not owner");

      // Another user cannot publish
      await expect(
        surveyContract
          .connect(anotherCreator)
          .publishSurvey(SURVEY_CONFIG.MAX_SCORES),
      ).to.be.revertedWith("not owner");

      // Another user cannot delete
      await expect(
        surveyContract.connect(anotherCreator).deleteSurvey(),
      ).to.be.revertedWith("not owner");
    });

    it("As a Creator, I cannot respond to my own survey", async function () {
      // Publish survey
      await surveyContract
        .connect(creator)
        .publishSurvey(SURVEY_CONFIG.MAX_SCORES);

      // Try to respond as creator
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        creator.address,
      );
      buffer.add8(2).add8(3).add8(1);
      const encryptedInput = await buffer.encrypt();

      await expect(
        surveyContract
          .connect(creator)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("owner not allowed");
    });
  });

  describe("As a Creator, I can validate my inputs", function () {
    it("As a Creator, I cannot create survey with invalid parameters", async function () {
      // Empty symbol
      await expect(
        factory
          .connect(creator)
          .createSurvey(
            creator.address,
            "",
            SURVEY_CONFIG.METADATA,
            SURVEY_CONFIG.QUESTIONS,
            SURVEY_CONFIG.TOTAL_QUESTIONS,
            SURVEY_CONFIG.MAX_RESPONDENTS,
          ),
      ).to.be.revertedWith("symbol length invalid");

      // Symbol too long
      await expect(
        factory
          .connect(creator)
          .createSurvey(
            creator.address,
            "VERYLONGSYMBOL",
            SURVEY_CONFIG.METADATA,
            SURVEY_CONFIG.QUESTIONS,
            SURVEY_CONFIG.TOTAL_QUESTIONS,
            SURVEY_CONFIG.MAX_RESPONDENTS,
          ),
      ).to.be.revertedWith("symbol length invalid");

      // Invalid respondent limit
      await expect(
        factory.connect(creator).createSurvey(
          creator.address,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          0, // Invalid limit
        ),
      ).to.be.revertedWith("bad respondentLimit");

      // Invalid total questions
      await expect(
        factory.connect(creator).createSurvey(
          creator.address,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          0, // Invalid questions
          SURVEY_CONFIG.MAX_RESPONDENTS,
        ),
      ).to.be.revertedWith("totalQuestions out of range");
    });
  });
});
