import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";
import { ConfidentialSurvey__factory } from "../types/factories/ConfidentialSurvey__factory";

describe("ConfidentialSurvey Getter Functions", function () {
  let survey: ConfidentialSurvey;
  let owner: any;
  let alice: any;

  beforeEach(async function () {
    [owner, alice] = await ethers.getSigners();

    const factory = new ConfidentialSurvey__factory(owner);
    survey = await factory.deploy(
      owner.address,
      "TEST",
      "metadata-cid",
      "questions-cid",
      3,
      5,
    );
  });

  it("should return correct survey owner", async function () {
    expect(await survey.getSurveyOwner()).to.equal(owner.address);
  });

  it("should return correct survey symbol", async function () {
    expect(await survey.getSurveySymbol()).to.equal("TEST");
  });

  it("should return correct total questions", async function () {
    expect(await survey.getTotalQuestions()).to.equal(3);
  });

  it("should return correct respondent limit", async function () {
    expect(await survey.getRespondentLimit()).to.equal(5);
  });

  it("should return initial survey status as Created", async function () {
    expect(await survey.getSurveyStatus()).to.equal(0); // Created
  });

  it("should return metadata CID", async function () {
    expect(await survey.getMetadataCID()).to.equal("metadata-cid");
  });

  it("should return questions CID", async function () {
    expect(await survey.getQuestionsCID()).to.equal("questions-cid");
  });

  it("should return false for isActive initially", async function () {
    expect(await survey.isActive()).to.equal(false);
  });

  it("should return false for isClosed initially", async function () {
    expect(await survey.isClosed()).to.equal(false);
  });

  it("should return false for isTrashed initially", async function () {
    expect(await survey.isTrashed()).to.equal(false);
  });

  it("should return zero total respondents initially", async function () {
    expect(await survey.getTotalRespondents()).to.equal(0);
  });

  it("should return full remaining slots initially", async function () {
    expect(await survey.getRemainingSlots()).to.equal(5);
  });

  it("should return zero progress initially", async function () {
    expect(await survey.getProgress()).to.equal(0);
  });

  it("should return false for hasReachedLimit initially", async function () {
    expect(await survey.hasReachedLimit()).to.equal(false);
  });

  describe("After publishing survey", function () {
    beforeEach(async function () {
      await survey.publishSurvey([5, 7, 10]);
    });

    it("should return true for isActive after publishing", async function () {
      expect(await survey.isActive()).to.equal(true);
    });

    it("should return Active status after publishing", async function () {
      expect(await survey.getSurveyStatus()).to.equal(1); // Active
    });

    it("should return correct max scores", async function () {
      expect(await survey.getMaxScore(0)).to.equal(5);
      expect(await survey.getMaxScore(1)).to.equal(7);
      expect(await survey.getMaxScore(2)).to.equal(10);
    });

    it("should return all max scores correctly", async function () {
      const maxScores = await survey.getAllMaxScores();
      expect(maxScores.length).to.equal(3);
      expect(maxScores[0]).to.equal(5);
      expect(maxScores[1]).to.equal(7);
      expect(maxScores[2]).to.equal(10);
    });
  });
});
