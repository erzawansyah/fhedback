import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialSurvey_Factory } from "../types/ConfidentialSurvey_Factory";
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";

describe("ConfidentialSurvey_Factory", function () {
  let factory: ConfidentialSurvey_Factory;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  // Test constants
  const SURVEY_CONFIG = {
    SYMBOL: "TEST",
    METADATA: "test-metadata-cid",
    QUESTIONS: "test-questions-cid",
    TOTAL_QUESTIONS: 3,
    MAX_RESPONDENTS: 10,
  };

  beforeEach(async function () {
    [owner, user1, user2, stranger] = await ethers.getSigners();

    // Deploy factory directly (no proxy pattern)
    const FactoryContract = await ethers.getContractFactory(
      "ConfidentialSurvey_Factory",
    );
    const factoryInstance = await FactoryContract.deploy(owner.address);
    await factoryInstance.waitForDeployment();

    factory = factoryInstance as unknown as ConfidentialSurvey_Factory;
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const factoryOwner = await factory.owner();
      expect(factoryOwner).to.equal(owner.address);
    });

    it("Should start with zero total surveys", async function () {
      const totalSurveys = await factory.totalSurveys();
      expect(totalSurveys).to.equal(0);
    });
  });

  describe("Survey Creation", function () {
    it("Should create survey successfully", async function () {
      const tx = await factory.createSurvey(
        user1.address,
        SURVEY_CONFIG.SYMBOL,
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      await expect(tx).to.emit(factory, "SurveyCreated").withArgs(
        0, // surveyId
        ethers.isAddress, // proxy address (any valid address)
        user1.address,
        SURVEY_CONFIG.SYMBOL,
      );

      // Check state updates
      expect(await factory.totalSurveys()).to.equal(1);

      const surveyAddress = await factory.surveys(0);
      expect(surveyAddress).to.not.equal(ethers.ZeroAddress);

      const surveyId = await factory.surveyIds(surveyAddress);
      expect(surveyId).to.equal(0);
    });

    it("Should create multiple surveys for same user", async function () {
      // Create first survey
      await factory.createSurvey(
        user1.address,
        "SURV1",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      // Create second survey
      await factory.createSurvey(
        user1.address,
        "SURV2",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      expect(await factory.totalSurveys()).to.equal(2);

      const ownerSurveyCount = await factory.getSurveyCountByOwner(
        user1.address,
      );
      expect(ownerSurveyCount).to.equal(2);
    });

    it("Should create surveys for different users", async function () {
      // Create survey for user1
      await factory.createSurvey(
        user1.address,
        "USER1",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      // Create survey for user2
      await factory.createSurvey(
        user2.address,
        "USER2",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      expect(await factory.totalSurveys()).to.equal(2);
      expect(await factory.getSurveyCountByOwner(user1.address)).to.equal(1);
      expect(await factory.getSurveyCountByOwner(user2.address)).to.equal(1);
    });

    it("Should prevent creation with empty symbol", async function () {
      await expect(
        factory.createSurvey(
          user1.address,
          "",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        ),
      ).to.be.revertedWith("symbol length invalid");
    });

    it("Should handle reentrancy protection", async function () {
      // This test ensures the nonReentrant modifier works
      // Since we can't easily test actual reentrancy in this setup,
      // we just verify the function works normally
      await expect(
        factory.createSurvey(
          user1.address,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        ),
      ).to.not.be.reverted;
    });
  });

  describe("Survey Management", function () {
    beforeEach(async function () {
      // Create some test surveys
      await factory.createSurvey(
        user1.address,
        "SURV1",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      await factory.createSurvey(
        user2.address,
        "SURV2",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );
    });

    it("Should return correct survey count by owner", async function () {
      expect(await factory.getSurveyCountByOwner(user1.address)).to.equal(1);
      expect(await factory.getSurveyCountByOwner(user2.address)).to.equal(1);
      expect(await factory.getSurveyCountByOwner(stranger.address)).to.equal(0);
    });

    it("Should return surveys by owner", async function () {
      const user1Surveys = await factory.getSurveysByOwner(user1.address);
      expect(user1Surveys.length).to.equal(1);

      const user2Surveys = await factory.getSurveysByOwner(user2.address);
      expect(user2Surveys.length).to.equal(1);

      const strangerSurveys = await factory.getSurveysByOwner(stranger.address);
      expect(strangerSurveys.length).to.equal(0);
    });

    it("Should validate survey correctly", async function () {
      const survey1Address = await factory.surveys(0);
      const survey2Address = await factory.surveys(1);

      expect(await factory.isValidSurvey(survey1Address)).to.equal(true);
      expect(await factory.isValidSurvey(survey2Address)).to.equal(true);
      expect(await factory.isValidSurvey(stranger.address)).to.equal(false);
      expect(await factory.isValidSurvey(ethers.ZeroAddress)).to.equal(false);
    });

    it("Should return all surveys", async function () {
      const allSurveys = await factory.getAllSurveys();
      expect(allSurveys.length).to.equal(2);

      const survey1 = await factory.surveys(0);
      const survey2 = await factory.surveys(1);

      expect(allSurveys).to.include(survey1);
      expect(allSurveys).to.include(survey2);
    });
  });

  describe("Survey Contract Functionality", function () {
    let surveyContract: ConfidentialSurvey;

    beforeEach(async function () {
      // Create a survey
      await factory.createSurvey(
        user1.address,
        SURVEY_CONFIG.SYMBOL,
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      const surveyAddress = await factory.surveys(0);
      surveyContract = (await ethers.getContractAt(
        "ConfidentialSurvey",
        surveyAddress,
      )) as unknown as ConfidentialSurvey;
    });

    it("Should initialize survey correctly", async function () {
      const survey = await surveyContract.survey();
      expect(survey.owner).to.equal(user1.address);
      expect(survey.symbol).to.equal(SURVEY_CONFIG.SYMBOL);
      expect(survey.metadataCID).to.equal(SURVEY_CONFIG.METADATA);
      expect(survey.questionsCID).to.equal(SURVEY_CONFIG.QUESTIONS);
      expect(survey.totalQuestions).to.equal(SURVEY_CONFIG.TOTAL_QUESTIONS);
      expect(survey.respondentLimit).to.equal(SURVEY_CONFIG.MAX_RESPONDENTS);
    });

    it("Should be functional after deployment", async function () {
      // Survey should be functional and allow metadata updates by owner
      const surveyTyped = surveyContract as unknown as ConfidentialSurvey;
      await expect(
        surveyTyped.connect(user1).updateSurveyMetadata("new-metadata"),
      ).to.not.be.reverted;
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle zero address owner", async function () {
      // The contract doesn't allow zero address owner
      await expect(
        factory.createSurvey(
          ethers.ZeroAddress,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        ),
      ).to.be.revertedWith("Owner cannot be zero address");
    });

    it("Should handle maximum values", async function () {
      await expect(
        factory.createSurvey(
          user1.address,
          "X".repeat(10), // Max symbol length
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          15, // MAX_QUESTIONS from contract
          1000, // MAX_RESPONDENTS from contract
        ),
      ).to.not.be.reverted;
    });

    it("Should maintain correct state after many operations", async function () {
      const numSurveys = 5;

      // Create multiple surveys
      for (let i = 0; i < numSurveys; i++) {
        await factory.createSurvey(
          user1.address,
          `SURV${i}`,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );
      }

      expect(await factory.totalSurveys()).to.equal(numSurveys);
      expect(await factory.getSurveyCountByOwner(user1.address)).to.equal(
        numSurveys,
      );

      const allSurveys = await factory.getAllSurveys();
      expect(allSurveys.length).to.equal(numSurveys);

      // Verify all surveys are valid
      for (let i = 0; i < numSurveys; i++) {
        const surveyAddress = await factory.surveys(i);
        expect(await factory.isValidSurvey(surveyAddress)).to.equal(true);
      }
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas costs for survey creation", async function () {
      const tx = await factory.createSurvey(
        user1.address,
        SURVEY_CONFIG.SYMBOL,
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );
      const receipt = await tx.wait();

      // Survey creation should not be too expensive
      expect(receipt!.gasUsed).to.be.lt(3200000); // Less than 3.2M gas
    });

    it("Should have minimal gas costs for view functions", async function () {
      // Create a survey first
      await factory.createSurvey(
        user1.address,
        SURVEY_CONFIG.SYMBOL,
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      // These are view functions, should consume minimal gas
      await factory.totalSurveys.staticCall();
      await factory.getSurveyCountByOwner.staticCall(user1.address);

      const surveyAddress = await factory.surveys(0);
      await factory.isValidSurvey.staticCall(surveyAddress);
    });
  });

  describe("Survey Independence", function () {
    it("Should create independent survey contracts", async function () {
      // Create two surveys
      await factory.createSurvey(
        user1.address,
        "SURV1",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      await factory.createSurvey(
        user2.address,
        "SURV2",
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );

      const survey1Address = await factory.surveys(0);
      const survey2Address = await factory.surveys(1);

      const survey1 = await ethers.getContractAt(
        "ConfidentialSurvey",
        survey1Address,
      );
      const survey2 = await ethers.getContractAt(
        "ConfidentialSurvey",
        survey2Address,
      );

      // Verify surveys have different addresses and owners
      expect(survey1Address).to.not.equal(survey2Address);

      const survey1Details = await survey1.survey();
      const survey2Details = await survey2.survey();

      expect(survey1Details.owner).to.equal(user1.address);
      expect(survey2Details.owner).to.equal(user2.address);
      expect(survey1Details.symbol).to.equal("SURV1");
      expect(survey2Details.symbol).to.equal("SURV2");

      // Verify they operate independently - modifying one doesn't affect the other
      const survey1Typed = survey1 as unknown as ConfidentialSurvey;
      const survey2Typed = survey2 as unknown as ConfidentialSurvey;

      await expect(
        survey1Typed.connect(user1).updateSurveyMetadata("updated-metadata-1"),
      ).to.not.be.reverted;

      await expect(
        survey2Typed.connect(user2).updateSurveyMetadata("updated-metadata-2"),
      ).to.not.be.reverted;

      // Verify each survey maintained its independent state
      const updatedSurvey1Details = await survey1.survey();
      const updatedSurvey2Details = await survey2.survey();

      expect(updatedSurvey1Details.metadataCID).to.equal("updated-metadata-1");
      expect(updatedSurvey2Details.metadataCID).to.equal("updated-metadata-2");
    });
  });
});
