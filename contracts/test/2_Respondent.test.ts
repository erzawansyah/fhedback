import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialSurvey_Factory } from "../types/ConfidentialSurvey_Factory";
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";

/**
 * Test Suite: Respondent User Flow
 *
 * This test suite covers all scenarios from the perspective of survey respondents.
 * It tests encrypted response submission and respondent-specific access patterns.
 */
describe("Respondent User Flow", function () {
  let factory: ConfidentialSurvey_Factory;
  let surveyContract: ConfidentialSurvey;
  let creator: HardhatEthersSigner;
  let respondent1: HardhatEthersSigner;
  let respondent2: HardhatEthersSigner;
  let respondent3: HardhatEthersSigner;

  const SURVEY_CONFIG = {
    SYMBOL: "RESP",
    METADATA: "QmMetadata123",
    QUESTIONS: "QmQuestions456",
    TOTAL_QUESTIONS: 3,
    MAX_RESPONDENTS: 5,
    MAX_SCORES: [5, 10, 3],
  };

  beforeEach(async function () {
    [creator, respondent1, respondent2, respondent3] =
      await ethers.getSigners();

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

  describe("As a Respondent, I can participate in surveys", function () {
    it("As a Respondent, I can view active survey details", async function () {
      const survey = await surveyContract.survey();

      expect(survey.status).to.equal(1); // Active
      expect(survey.totalQuestions).to.equal(SURVEY_CONFIG.TOTAL_QUESTIONS);
      expect(survey.respondentLimit).to.equal(SURVEY_CONFIG.MAX_RESPONDENTS);
      expect(await surveyContract.isActive()).to.be.true;
    });

    it("As a Respondent, I can check if I can participate", async function () {
      // Initially haven't responded
      expect(await surveyContract.getHasResponded(respondent1.address)).to.be
        .false;

      // Survey is not full
      expect(await surveyContract.hasReachedLimit()).to.be.false;
      expect(await surveyContract.getRemainingSlots()).to.equal(
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );
    });

    it("As a Respondent, I can submit encrypted responses", async function () {
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer.add8(3).add8(7).add8(2); // Valid responses within max scores [5, 10, 3]
      const encryptedInput = await buffer.encrypt();

      await expect(
        surveyContract
          .connect(respondent1)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      )
        .to.emit(surveyContract, "ResponseSubmitted")
        .withArgs(respondent1.address);

      // Verify response was recorded
      expect(await surveyContract.getHasResponded(respondent1.address)).to.be
        .true;
      expect(await surveyContract.getTotalRespondents()).to.equal(1);
      expect(await surveyContract.getRespondentAt(0)).to.equal(
        respondent1.address,
      );
    });

    it("As a Respondent, I cannot respond twice", async function () {
      // Submit first response
      const buffer1 = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer1.add8(3).add8(7).add8(2);
      const encryptedInput1 = await buffer1.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput1.handles, encryptedInput1.inputProof);

      // Try to submit again
      const buffer2 = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer2.add8(1).add8(5).add8(3);
      const encryptedInput2 = await buffer2.encrypt();

      await expect(
        surveyContract
          .connect(respondent1)
          .submitResponses(encryptedInput2.handles, encryptedInput2.inputProof),
      ).to.be.revertedWith("already responded");
    });

    it("As a Respondent, I must provide valid response count", async function () {
      // Too few responses (only 2 for 3 questions)
      const bufferTooFew = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      bufferTooFew.add8(3).add8(7); // Only 2 responses
      const encryptedInputTooFew = await bufferTooFew.encrypt();

      await expect(
        surveyContract
          .connect(respondent1)
          .submitResponses(
            encryptedInputTooFew.handles,
            encryptedInputTooFew.inputProof,
          ),
      ).to.be.revertedWith("invalid response count");

      // Too many responses (4 for 3 questions)
      const bufferTooMany = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      bufferTooMany.add8(3).add8(7).add8(2).add8(1); // 4 responses
      const encryptedInputTooMany = await bufferTooMany.encrypt();

      await expect(
        surveyContract
          .connect(respondent1)
          .submitResponses(
            encryptedInputTooMany.handles,
            encryptedInputTooMany.inputProof,
          ),
      ).to.be.revertedWith("invalid response count");
    });
  });

  describe("As a Respondent, I can view my participation status", function () {
    beforeEach(async function () {
      // Submit a response
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);
    });

    it("As a Respondent, I can check my response status", async function () {
      expect(await surveyContract.getHasResponded(respondent1.address)).to.be
        .true;
    });

    it("As a Respondent, I can see my position in respondent list", async function () {
      expect(await surveyContract.getRespondentAt(0)).to.equal(
        respondent1.address,
      );

      // Add second respondent
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent2.address,
      );
      buffer.add8(1).add8(5).add8(3);
      const encryptedInput = await buffer.encrypt();

      await surveyContract
        .connect(respondent2)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      expect(await surveyContract.getRespondentAt(1)).to.equal(
        respondent2.address,
      );
      expect(await surveyContract.getTotalRespondents()).to.equal(2);
    });

    it("As a Respondent, I can view survey progress", async function () {
      const progress = await surveyContract.getProgress();
      const expectedProgress = Math.floor(
        (1 * 10000) / SURVEY_CONFIG.MAX_RESPONDENTS,
      ); // 1 out of 5 = 20%
      expect(progress).to.equal(expectedProgress);

      expect(await surveyContract.getRemainingSlots()).to.equal(4);
      expect(await surveyContract.hasReachedLimit()).to.be.false;
    });
  });

  describe("As a Respondent, I cannot participate in inappropriate surveys", function () {
    it("As a Respondent, I cannot respond to inactive survey", async function () {
      // Create but don't publish survey
      await factory
        .connect(creator)
        .createSurvey(
          creator.address,
          "INACTIVE",
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

      const inactiveSurveyAddress = await factory.getSurveyAddress(1);
      const inactiveSurvey = (await ethers.getContractAt(
        "ConfidentialSurvey",
        inactiveSurveyAddress,
      )) as unknown as ConfidentialSurvey;

      const buffer = fhevm.createEncryptedInput(
        await inactiveSurvey.getAddress(),
        respondent1.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await expect(
        inactiveSurvey
          .connect(respondent1)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("not active");
    });

    it("As a Respondent, I cannot respond to closed survey", async function () {
      // First submit a response to meet minimum requirement
      const buffer1 = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer1.add8(3).add8(7).add8(2);
      const encryptedInput1 = await buffer1.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput1.handles, encryptedInput1.inputProof);

      // Close the survey
      await surveyContract.connect(creator).closeSurvey();

      // Try to respond as second respondent
      const buffer2 = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent2.address,
      );
      buffer2.add8(1).add8(5).add8(3);
      const encryptedInput2 = await buffer2.encrypt();

      await expect(
        surveyContract
          .connect(respondent2)
          .submitResponses(encryptedInput2.handles, encryptedInput2.inputProof),
      ).to.be.revertedWith("not active");
    });

    it("As a Respondent, I cannot respond to full survey", async function () {
      // Fill the survey to capacity (5 respondents)
      const signers = await ethers.getSigners();
      const allRespondents = [
        respondent1,
        respondent2,
        respondent3,
        signers[4],
        signers[5],
      ];

      for (let i = 0; i < 5; i++) {
        const buffer = fhevm.createEncryptedInput(
          await surveyContract.getAddress(),
          allRespondents[i].address,
        );
        buffer
          .add8(1 + (i % 5))
          .add8(2 + (i % 10))
          .add8(1 + (i % 3)); // Varying valid responses
        const encryptedInput = await buffer.encrypt();

        await surveyContract
          .connect(allRespondents[i])
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof);
      }

      expect(await surveyContract.hasReachedLimit()).to.be.true;
      expect(await surveyContract.getRemainingSlots()).to.equal(0);

      // Try to add one more respondent
      const extraRespondent = signers[6];
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        extraRespondent.address,
      );
      buffer.add8(2).add8(5).add8(1);
      const encryptedInput = await buffer.encrypt();

      await expect(
        surveyContract
          .connect(extraRespondent)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("respondent limit reached");
    });

    it("As the survey owner, I cannot respond to my own survey", async function () {
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        creator.address,
      );
      buffer.add8(3).add8(7).add8(2);
      const encryptedInput = await buffer.encrypt();

      await expect(
        surveyContract
          .connect(creator)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("owner not allowed");
    });
  });

  describe("As a Respondent, I can see survey completion status", function () {
    it("As a Respondent, I can track survey filling up", async function () {
      expect(await surveyContract.getProgress()).to.equal(0);
      expect(await surveyContract.getRemainingSlots()).to.equal(5);

      // Add first respondent
      const buffer1 = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent1.address,
      );
      buffer1.add8(3).add8(7).add8(2);
      const encryptedInput1 = await buffer1.encrypt();

      await surveyContract
        .connect(respondent1)
        .submitResponses(encryptedInput1.handles, encryptedInput1.inputProof);

      expect(await surveyContract.getProgress()).to.equal(2000); // 20% = 2000/10000
      expect(await surveyContract.getRemainingSlots()).to.equal(4);

      // Add second respondent
      const buffer2 = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        respondent2.address,
      );
      buffer2.add8(1).add8(5).add8(3);
      const encryptedInput2 = await buffer2.encrypt();

      await surveyContract
        .connect(respondent2)
        .submitResponses(encryptedInput2.handles, encryptedInput2.inputProof);

      expect(await surveyContract.getProgress()).to.equal(4000); // 40% = 4000/10000
      expect(await surveyContract.getRemainingSlots()).to.equal(3);
    });

    it("As a Respondent, I can see when survey reaches capacity", async function () {
      // Fill survey to capacity
      const signers = await ethers.getSigners();
      const respondents = [
        respondent1,
        respondent2,
        respondent3,
        signers[4],
        signers[5],
      ];

      for (let i = 0; i < 5; i++) {
        const buffer = fhevm.createEncryptedInput(
          await surveyContract.getAddress(),
          respondents[i].address,
        );
        buffer
          .add8(1 + (i % 5))
          .add8(2 + (i % 10))
          .add8(1 + (i % 3));
        const encryptedInput = await buffer.encrypt();

        await surveyContract
          .connect(respondents[i])
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof);
      }

      expect(await surveyContract.getProgress()).to.equal(10000); // 100%
      expect(await surveyContract.getRemainingSlots()).to.equal(0);
      expect(await surveyContract.hasReachedLimit()).to.be.true;
    });
  });
});
