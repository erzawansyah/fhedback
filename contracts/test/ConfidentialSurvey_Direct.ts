import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialSurvey } from "../types/contracts/ConfidentialSurvey";
import { ConfidentialSurvey__factory } from "../types/factories/contracts/ConfidentialSurvey__factory";

type Signers = {
  owner: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
  dave: HardhatEthersSigner;
  eve: HardhatEthersSigner;
  frealy: HardhatEthersSigner;
  stranger: HardhatEthersSigner;
};

// Test structure aliases for better readability
const describe_flow = describe;
const it_test = it;

type InitializationArgs = {
  owner?: string;
  symbol?: string;
  metadataCID?: string;
  questionsCID?: string;
  totalQuestions?: number;
  respondentLimit?: number;
};

describe_flow(
  "ConfidentialSurvey_Direct.sol - Complete Survey Lifecycle",
  function () {
    let signers: Signers;
    let surveyContract: ConfidentialSurvey;

    // Test constants
    const SURVEY_CONFIG = {
      SYMBOL: "SURV",
      METADATA: "cid-meta",
      QUESTIONS: "cid-quest",
      TOTAL_QUESTIONS: 3,
      MAX_RESPONDENTS: 6,
      MAX_SCORES: [5, 5, 5],
    };

    before(async function () {
      const signersArray = await ethers.getSigners();
      signers = {
        owner: signersArray[0],
        alice: signersArray[1],
        bob: signersArray[2],
        charlie: signersArray[3],
        dave: signersArray[4],
        eve: signersArray[5],
        frealy: signersArray[6],
        stranger: signersArray[7],
      };
    });

    async function deploySurveyDirect(
      args: InitializationArgs = {},
    ): Promise<ConfidentialSurvey> {
      const factory = new ConfidentialSurvey__factory(signers.owner);

      return await factory.deploy(
        args.owner ?? signers.owner.address,
        args.symbol ?? SURVEY_CONFIG.SYMBOL,
        args.metadataCID ?? SURVEY_CONFIG.METADATA,
        args.questionsCID ?? SURVEY_CONFIG.QUESTIONS,
        args.totalQuestions ?? SURVEY_CONFIG.TOTAL_QUESTIONS,
        args.respondentLimit ?? SURVEY_CONFIG.MAX_RESPONDENTS,
      );
    }

    describe_flow("Contract Deployment", function () {
      it_test(
        "should deploy successfully with valid parameters",
        async function () {
          surveyContract = await deploySurveyDirect();
          expect(surveyContract.target).to.be.a("string");
        },
      );

      it_test("should set initial state correctly", async function () {
        surveyContract = await deploySurveyDirect();

        // Check survey details
        const surveyDetails = await surveyContract.survey();
        expect(surveyDetails[0]).to.equal(signers.owner.address); // owner
        expect(surveyDetails[1]).to.equal(SURVEY_CONFIG.SYMBOL); // symbol
        expect(surveyDetails[2]).to.equal(SURVEY_CONFIG.METADATA); // metadataCID
        expect(surveyDetails[3]).to.equal(SURVEY_CONFIG.QUESTIONS); // questionsCID
        expect(surveyDetails[4]).to.equal(SURVEY_CONFIG.TOTAL_QUESTIONS); // totalQuestions
        expect(surveyDetails[5]).to.equal(SURVEY_CONFIG.MAX_RESPONDENTS); // respondentLimit
        expect(surveyDetails[6]).to.be.gt(0); // createdAt
        expect(surveyDetails[7]).to.equal(0); // status (Created)
      });

      it_test("should emit SurveyCreated event", async function () {
        const factory = new ConfidentialSurvey__factory(signers.owner);

        const contract = await factory.deploy(
          signers.owner.address,
          SURVEY_CONFIG.SYMBOL,
          SURVEY_CONFIG.METADATA,
          SURVEY_CONFIG.QUESTIONS,
          SURVEY_CONFIG.TOTAL_QUESTIONS,
          SURVEY_CONFIG.MAX_RESPONDENTS,
        );

        // Get deployment transaction from the contract
        const deploymentTx = contract.deploymentTransaction();
        if (deploymentTx) {
          await expect(deploymentTx)
            .to.emit(contract, "SurveyCreated")
            .withArgs(
              signers.owner.address,
              SURVEY_CONFIG.SYMBOL,
              SURVEY_CONFIG.METADATA,
            );
        }
      });
    });

    describe_flow("Survey Management", function () {
      beforeEach(async function () {
        surveyContract = await deploySurveyDirect();
      });

      it_test("should allow owner to update metadata", async function () {
        const newCID = "new-metadata-cid";
        await expect(surveyContract.updateSurveyMetadata(newCID))
          .to.emit(surveyContract, "SurveyMetadataUpdated")
          .withArgs(newCID);
      });

      it_test(
        "should not allow non-owner to update metadata",
        async function () {
          await expect(
            surveyContract
              .connect(signers.alice)
              .updateSurveyMetadata("unauthorized-cid"),
          ).to.be.revertedWith("not owner");
        },
      );

      it_test("should allow owner to update questions", async function () {
        const newCID = "new-questions-cid";
        const newTotalQuestions = 5;

        await expect(surveyContract.updateQuestions(newCID, newTotalQuestions))
          .to.emit(surveyContract, "SurveyQuestionsUpdated")
          .withArgs(newTotalQuestions);
      });

      it_test(
        "should not allow non-owner to update questions",
        async function () {
          await expect(
            surveyContract
              .connect(signers.alice)
              .updateQuestions("unauthorized-cid", 5),
          ).to.be.revertedWith("not owner");
        },
      );

      it_test("should allow owner to publish survey", async function () {
        await expect(
          surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES),
        ).to.emit(surveyContract, "SurveyPublished");
      });

      it_test("should allow owner to delete survey", async function () {
        await expect(surveyContract.deleteSurvey()).to.emit(
          surveyContract,
          "SurveyDeleted",
        );
      });
    });

    describe_flow("Parameter Validation", function () {
      it_test("should reject invalid respondent limit", async function () {
        await expect(
          deploySurveyDirect({ respondentLimit: 0 }),
        ).to.be.revertedWith("bad respondentLimit");

        await expect(
          deploySurveyDirect({ respondentLimit: 1001 }),
        ).to.be.revertedWith("bad respondentLimit");
      });

      it_test("should reject invalid symbol length", async function () {
        await expect(deploySurveyDirect({ symbol: "" })).to.be.revertedWith(
          "symbol length invalid",
        );

        await expect(
          deploySurveyDirect({ symbol: "VERYLONGSYMBOL" }),
        ).to.be.revertedWith("symbol length invalid");
      });

      it_test("should reject invalid total questions", async function () {
        await expect(
          deploySurveyDirect({ totalQuestions: 0 }),
        ).to.be.revertedWith("totalQuestions out of range");

        await expect(
          deploySurveyDirect({ totalQuestions: 16 }),
        ).to.be.revertedWith("totalQuestions out of range");
      });
    });
  },
);
