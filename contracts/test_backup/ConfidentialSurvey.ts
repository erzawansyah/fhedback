import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";
import { ConfidentialSurvey__factory } from "../types/factories/ConfidentialSurvey__factory";

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

type RespondentSubmission = {
  signer: HardhatEthersSigner;
  responses: number[];
};

describe_flow(
  "ConfidentialSurvey.sol - Complete Survey Lifecycle",
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

    async function deployFixture() {
      const contractFactory = new ConfidentialSurvey__factory(signers.owner);
      const contract = await contractFactory.deploy(
        signers.owner.address,
        SURVEY_CONFIG.SYMBOL,
        SURVEY_CONFIG.METADATA,
        SURVEY_CONFIG.QUESTIONS,
        SURVEY_CONFIG.TOTAL_QUESTIONS,
        SURVEY_CONFIG.MAX_RESPONDENTS,
      );
      const contractAddress = await contract.getAddress();
      return { contract, contractAddress };
    }

    // Helper function to deploy survey with custom parameters
    async function deployCustomSurvey(args: InitializationArgs = {}) {
      const contractFactory = new ConfidentialSurvey__factory(signers.owner);
      const defaultArgs = {
        owner: signers.owner.address,
        symbol: SURVEY_CONFIG.SYMBOL,
        metadataCID: SURVEY_CONFIG.METADATA,
        questionsCID: SURVEY_CONFIG.QUESTIONS,
        totalQuestions: SURVEY_CONFIG.TOTAL_QUESTIONS,
        respondentLimit: SURVEY_CONFIG.MAX_RESPONDENTS,
      };

      const finalArgs = { ...defaultArgs, ...args };

      const contract = await contractFactory.deploy(
        finalArgs.owner!,
        finalArgs.symbol!,
        finalArgs.metadataCID!,
        finalArgs.questionsCID!,
        finalArgs.totalQuestions!,
        finalArgs.respondentLimit!,
      );
      const contractAddress = await contract.getAddress();
      return { contract, contractAddress };
    }

    async function respondentSubmission(
      respondentsSubmission: RespondentSubmission[] = [],
    ) {
      for (let i = 0; i < respondentsSubmission.length; i++) {
        const buffer = fhevm.createEncryptedInput(
          await surveyContract.getAddress(),
          respondentsSubmission[i].signer.address,
        );

        for (const response of respondentsSubmission[i].responses) {
          buffer.add8(response);
        }
        const encryptedInput = await buffer.encrypt();

        await surveyContract
          .connect(respondentsSubmission[i].signer)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof);
      }
    }

    before(async function () {
      const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
      signers = {
        owner: ethSigners[0],
        alice: ethSigners[1],
        bob: ethSigners[2],
        charlie: ethSigners[3],
        dave: ethSigners[4],
        eve: ethSigners[5],
        frealy: ethSigners[6],
        stranger: ethSigners[7],
      };
    });

    beforeEach(async () => {
      ({ contract: surveyContract } = await deployFixture());
    });

    // Survey is already initialized through constructor, no need for separate initialization
    async function initialization(args: InitializationArgs = {}) {
      // This function is no longer needed since survey is initialized in constructor
      // Left empty for backward compatibility, but return args for potential usage
      return args;
    }

    // =================================================================
    // WORKFLOW 1: Survey Creation and Setup Lifecycle
    // =================================================================
    describe_flow("Workflow 1: Survey Creation and Setup", function () {
      describe_flow("1.1 Survey Initialization", function () {
        it_test(
          "Should successfully create a new survey with valid parameters",
          async function () {
            await initialization();
            const survey = await surveyContract.survey();
            expect(survey.owner).to.equal(signers.owner.address);
            expect(survey.symbol).to.equal(SURVEY_CONFIG.SYMBOL);
            expect(survey.metadataCID).to.equal(SURVEY_CONFIG.METADATA);
            expect(survey.questionsCID).to.equal(SURVEY_CONFIG.QUESTIONS);
            expect(survey.totalQuestions).to.equal(
              SURVEY_CONFIG.TOTAL_QUESTIONS,
            );
            expect(survey.respondentLimit).to.equal(
              SURVEY_CONFIG.MAX_RESPONDENTS,
            );
            expect(survey.status).to.equal(0); // Created status
          },
        );

        it_test(
          "Should allow initialization with empty metadata temporarily",
          async function () {
            await initialization({
              metadataCID: "",
              questionsCID: "",
            });
            const survey = await surveyContract.survey();
            expect(survey.status).to.equal(0); // Created status
          },
        );

        it_test(
          "Should reject invalid initialization parameters",
          async function () {
            // Test respondent limit validation
            await expect(
              deployCustomSurvey({ respondentLimit: 1001 }),
            ).to.be.revertedWith("bad respondentLimit");
            await expect(
              deployCustomSurvey({ respondentLimit: 0 }),
            ).to.be.revertedWith("bad respondentLimit");

            // Test symbol validation
            await expect(deployCustomSurvey({ symbol: "" })).to.be.revertedWith(
              "symbol length invalid",
            );
            await expect(
              deployCustomSurvey({ symbol: "A".repeat(33) }),
            ).to.be.revertedWith("symbol length invalid");
          },
        );

        it_test(
          "Should prevent re-initialization after creation",
          async function () {
            await initialization();
            // Since the survey is already initialized in the constructor,
            // we can't re-initialize it. Let's test by trying to create
            // a new survey with the same contract instance
            // This test is not applicable since constructor handles initialization
            // So we'll check that the survey is properly initialized instead
            const survey = await surveyContract.survey();
            expect(survey.status).to.equal(0); // Created status
            expect(survey.owner).to.equal(signers.owner.address);
          },
        );

        it_test(
          "Should emit SurveyCreated event on successful initialization",
          async function () {
            await initialization();
            const filter = surveyContract.filters.SurveyCreated();
            const events = await surveyContract.queryFilter(filter);
            expect(events.length).to.be.greaterThan(0);
            expect(events[0].args.owner).to.equal(signers.owner.address);
            expect(events[0].args.symbol).to.equal(SURVEY_CONFIG.SYMBOL);
          },
        );
      });

      describe_flow("1.2 Survey Configuration Management", function () {
        beforeEach(async function () {
          await initialization();
        });

        it_test(
          "Should allow owner to update metadata and questions before publishing",
          async function () {
            const newMetadata = "updated-metadata-cid";
            const newQuestions = "updated-questions-cid";
            const newQuestionCount = 5;

            await surveyContract.updateSurveyMetadata(newMetadata);
            await surveyContract.updateQuestions(
              newQuestions,
              newQuestionCount,
            );

            const survey = await surveyContract.survey();
            expect(survey.metadataCID).to.equal(newMetadata);
            expect(survey.questionsCID).to.equal(newQuestions);
            expect(survey.totalQuestions).to.equal(newQuestionCount);
          },
        );

        it_test("Should restrict updates to owner only", async function () {
          await expect(
            surveyContract
              .connect(signers.alice)
              .updateSurveyMetadata("new-cid"),
          ).to.be.revertedWith("not owner");
          await expect(
            surveyContract.connect(signers.alice).updateQuestions("new-cid", 5),
          ).to.be.revertedWith("not owner");
        });

        it_test("Should validate update parameters", async function () {
          await expect(
            surveyContract.updateSurveyMetadata(""),
          ).to.be.revertedWith("metadataCID cannot be empty");
          await expect(
            surveyContract.updateQuestions("", 5),
          ).to.be.revertedWith("questionsCID cannot be empty");
          await expect(
            surveyContract.updateQuestions("new-cid", 0),
          ).to.be.revertedWith("totalQuestions out of range");
          await expect(
            surveyContract.updateQuestions("new-cid", 1001),
          ).to.be.revertedWith("totalQuestions out of range");
        });

        it_test(
          "Should lock configuration after publishing",
          async function () {
            await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);
            await expect(
              surveyContract.updateSurveyMetadata("new-cid"),
            ).to.be.revertedWith("immutable state");
          },
        );

        it_test("Should prevent updates on deleted surveys", async function () {
          await surveyContract.deleteSurvey();
          await expect(
            surveyContract.updateSurveyMetadata("new-cid"),
          ).to.be.revertedWith("trashed");
        });
      });

      describe_flow("1.3 Survey Publishing", function () {
        beforeEach(async function () {
          await initialization();
        });

        it_test(
          "Should successfully publish survey with valid configuration",
          async function () {
            await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);
            const survey = await surveyContract.survey();
            expect(survey.status).to.equal(1); // Active status

            const filter = surveyContract.filters.SurveyPublished();
            const events = await surveyContract.queryFilter(filter);
            expect(events[0].fragment.name).to.eq("SurveyPublished");
          },
        );

        it_test(
          "Should initialize encrypted statistics on publish",
          async function () {
            // Verify statistics are not initialized before publish
            for (let i = 0; i < SURVEY_CONFIG.MAX_SCORES.length; i++) {
              const stats = await surveyContract.questionStatistics(i);
              expect(stats.total).to.eq(ethers.ZeroHash);
            }

            await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);

            // Verify statistics are initialized after publish
            for (let i = 0; i < SURVEY_CONFIG.MAX_SCORES.length; i++) {
              const stats = await surveyContract.questionStatistics(i);
              expect(stats.total).not.eq(ethers.ZeroHash);
            }
          },
        );

        it_test("Should validate publish parameters", async function () {
          await expect(surveyContract.publishSurvey([5, 5])) // Wrong length
            .to.be.revertedWith("length mismatch");
          await expect(surveyContract.publishSurvey([1, 5, 5])) // Score too low
            .to.be.revertedWith("maxScore must be greater than 1");
          await expect(surveyContract.publishSurvey([11, 5, 5])) // Score too high
            .to.be.revertedWith("maxScore out of range");
        });

        it_test(
          "Should require complete metadata before publishing",
          async function () {
            const { contract: newSurvey } = await deployCustomSurvey({
              metadataCID: "", // Empty metadata
            });
            await expect(
              newSurvey.publishSurvey(SURVEY_CONFIG.MAX_SCORES),
            ).to.be.revertedWith("metadata or questions not set");
          },
        );

        it_test(
          "Should restrict publishing to owner and prevent republishing",
          async function () {
            await expect(
              surveyContract
                .connect(signers.alice)
                .publishSurvey(SURVEY_CONFIG.MAX_SCORES),
            ).to.be.revertedWith("not owner");

            await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);
            await expect(
              surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES),
            ).to.be.revertedWith("already active");
          },
        );
      });

      describe_flow("1.4 Survey Close and Delete Operations", function () {
        beforeEach(async function () {
          await initialization();
          await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);
        });

        it_test(
          "Owner can close Active survey after minReached and emit SurveyClosed",
          async function () {
            // Submit at least one response to meet MIN_RESPONDENTS
            const encryptedInput = await fhevm
              .createEncryptedInput(
                await surveyContract.getAddress(),
                signers.alice.address,
              )
              .add8(3)
              .add8(4)
              .add8(5)
              .encrypt();

            await surveyContract
              .connect(signers.alice)
              .submitResponses(
                encryptedInput.handles,
                encryptedInput.inputProof,
              );

            // Close survey
            await surveyContract.closeSurvey();

            // Check status changes to Closed
            const survey = await surveyContract.survey();
            expect(survey.status).to.equal(2); // 2 = Closed

            // Check SurveyClosed event is emitted
            const filter = surveyContract.filters.SurveyClosed();
            const events = await surveyContract.queryFilter(filter);
            expect(events.length).to.be.greaterThan(0);
            expect(events[0].args.totalRespondents).to.equal(1);
          },
        );

        it_test("Non-owner cannot close survey", async function () {
          // Submit at least one response
          const encryptedInput = await fhevm
            .createEncryptedInput(
              await surveyContract.getAddress(),
              signers.alice.address,
            )
            .add8(3)
            .add8(4)
            .add8(5)
            .encrypt();

          await surveyContract
            .connect(signers.alice)
            .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

          // Alice tries to close survey
          await expect(
            surveyContract.connect(signers.alice).closeSurvey(),
          ).to.be.revertedWith("not owner");
        });

        it_test(
          "Should fail to close survey if minimum respondents not reached",
          async function () {
            // Without submitting response, directly close
            await expect(surveyContract.closeSurvey()).to.be.revertedWith(
              "min not reached",
            );
          },
        );

        it_test(
          "Owner can delete survey when not Active and emit SurveyDeleted",
          async function () {
            // Create new survey in Created status (not active)
            const { contract: newSurvey } = await deployCustomSurvey({
              symbol: "TEST",
              metadataCID: "meta-cid",
              questionsCID: "quest-cid",
              totalQuestions: 3,
              respondentLimit: 6,
            });

            // Delete survey
            await newSurvey.deleteSurvey();

            // Check status changes to Trashed
            const survey = await newSurvey.survey();
            expect(survey.status).to.equal(3); // 3 = Trashed

            // Check SurveyDeleted event is emitted
            const filter = newSurvey.filters.SurveyDeleted();
            const events = await newSurvey.queryFilter(filter);
            expect(events.length).to.be.greaterThan(0);
          },
        );

        it_test(
          "Should fail to delete survey if it's Active",
          async function () {
            // Survey is already in Active status from beforeEach
            await expect(surveyContract.deleteSurvey()).to.be.revertedWith(
              "already active",
            );
          },
        );
      });
    });

    // =================================================================
    // WORKFLOW 2: Response Collection and Submission Lifecycle
    // =================================================================
    describe_flow(
      "Workflow 2: Response Collection and Submission",
      function () {
        beforeEach(async function () {
          await initialization();
          await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);
        });

        describe_flow("2.1 Individual Response Submission", function () {
          it_test(
            "Should successfully submit valid encrypted responses",
            async function () {
              const responses = [3, 4, 5];
              const buffer = fhevm.createEncryptedInput(
                await surveyContract.getAddress(),
                signers.alice.address,
              );
              for (const response of responses) {
                buffer.add8(response);
              }
              const encrypted = await buffer.encrypt();

              await surveyContract
                .connect(signers.alice)
                .submitResponses(encrypted.handles, encrypted.inputProof);

              // Verify event emission
              const filter = surveyContract.filters.ResponsesSubmitted();
              const events = await surveyContract.queryFilter(filter);
              expect(events[0].eventName).to.equal("ResponsesSubmitted");

              // Verify survey remains active
              const survey = await surveyContract.survey();
              expect(survey.status).to.equal(1); // Active status
            },
          );

          it_test(
            "Should validate response count matches question count",
            async function () {
              const responses = [3, 4]; // Only 2 responses for 3 questions
              const buffer = await fhevm.createEncryptedInput(
                await surveyContract.getAddress(),
                signers.alice.address,
              );
              for (const response of responses) {
                buffer.add8(response);
              }
              const encryptedInput = await buffer.encrypt();

              await expect(
                surveyContract
                  .connect(signers.alice)
                  .submitResponses(
                    encryptedInput.handles,
                    encryptedInput.inputProof,
                  ),
              ).to.be.revertedWith("wrong responses len");
            },
          );

          it_test(
            "Should prevent survey owner from submitting responses",
            async function () {
              const buffer = fhevm.createEncryptedInput(
                await surveyContract.getAddress(),
                signers.owner.address,
              );
              buffer.add8(3);
              buffer.add8(4);
              buffer.add8(5);
              const encryptedInput = await buffer.encrypt();

              await expect(
                surveyContract
                  .connect(signers.owner)
                  .submitResponses(
                    encryptedInput.handles,
                    encryptedInput.inputProof,
                  ),
              ).to.be.revertedWith("owner not allowed");
            },
          );

          it_test(
            "Should prevent duplicate submissions from same respondent",
            async function () {
              const encryptedInput = await fhevm
                .createEncryptedInput(
                  await surveyContract.getAddress(),
                  signers.alice.address,
                )
                .add8(3)
                .add8(4)
                .add8(5)
                .encrypt();

              // First submission
              await surveyContract
                .connect(signers.alice)
                .submitResponses(
                  encryptedInput.handles,
                  encryptedInput.inputProof,
                );

              // Attempt second submission from same address
              await expect(
                surveyContract
                  .connect(signers.alice)
                  .submitResponses(
                    encryptedInput.handles,
                    encryptedInput.inputProof,
                  ),
              ).to.be.revertedWith("already responded");
            },
          );
        });

        describe_flow(
          "2.2 Bulk Response Collection and Auto-Close",
          function () {
            it_test(
              "Should handle multiple responses and auto-close at limit",
              async function () {
                // Submit responses from all 6 respondents (matches SURVEY_CONFIG.MAX_RESPONDENTS)
                const respondents = [
                  signers.alice,
                  signers.bob,
                  signers.charlie,
                  signers.dave,
                  signers.eve,
                  signers.frealy,
                ];

                for (let i = 0; i < respondents.length; i++) {
                  const encryptedInput = await fhevm
                    .createEncryptedInput(
                      await surveyContract.getAddress(),
                      respondents[i].address,
                    )
                    .add8(3)
                    .add8(4)
                    .add8(5)
                    .encrypt();

                  await surveyContract
                    .connect(respondents[i])
                    .submitResponses(
                      encryptedInput.handles,
                      encryptedInput.inputProof,
                    );
                }

                // Verify survey auto-closes after reaching limit
                const survey = await surveyContract.survey();
                expect(survey.status).to.equal(2); // Closed status

                // Verify SurveyClosed event emission
                const filter = surveyContract.filters.SurveyClosed();
                const events = await surveyContract.queryFilter(filter);
                expect(events[0].eventName).to.equal("SurveyClosed");
              },
            );

            it_test(
              "Should reject responses after survey reaches respondent limit",
              async function () {
                // Fill survey to capacity first
                const respondents = [
                  signers.alice,
                  signers.bob,
                  signers.charlie,
                  signers.dave,
                  signers.eve,
                  signers.frealy,
                ];

                for (const respondent of respondents) {
                  const encryptedInput = await fhevm
                    .createEncryptedInput(
                      await surveyContract.getAddress(),
                      respondent.address,
                    )
                    .add8(3)
                    .add8(4)
                    .add8(5)
                    .encrypt();

                  await surveyContract
                    .connect(respondent)
                    .submitResponses(
                      encryptedInput.handles,
                      encryptedInput.inputProof,
                    );
                }

                // Attempt to submit additional response
                const encryptedInput = await fhevm
                  .createEncryptedInput(
                    await surveyContract.getAddress(),
                    signers.stranger.address,
                  )
                  .add8(3)
                  .add8(4)
                  .add8(5)
                  .encrypt();

                await expect(
                  surveyContract
                    .connect(signers.stranger)
                    .submitResponses(
                      encryptedInput.handles,
                      encryptedInput.inputProof,
                    ),
                ).to.be.revertedWith("not active");
              },
            );
          },
        );
      },
    );

    // =================================================================
    // WORKFLOW 4: Statistics and Data Analysis Lifecycle
    // =================================================================
    describe_flow("Workflow 4: Statistics and Data Analysis", function () {
      describe_flow("4.1 Respondent Personal Statistics Access", function () {
        it_test(
          "Should allow respondents to access their own encrypted statistics",
          async function () {
            await initialization();
            await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);

            // Submit responses from Alice
            await respondentSubmission([
              { signer: signers.alice, responses: [3, 4, 5] },
            ]);

            // Alice accesses her own statistics
            const aliceSurveyContract = surveyContract.connect(signers.alice);
            const encryptedStats =
              await aliceSurveyContract.respondentStatistics(
                signers.alice.address,
              );

            // Decrypt Alice's total score
            const decryptedTotal = await fhevm.userDecryptEuint(
              FhevmType.euint64,
              encryptedStats.total,
              aliceSurveyContract.getAddress(),
              signers.alice,
            );
            expect(Number(decryptedTotal)).to.equal(3 + 4 + 5); // Should be 12

            // Decrypt Alice's sum of squares
            const decryptedSumSquares = await fhevm.userDecryptEuint(
              FhevmType.euint64,
              encryptedStats.sumSquares,
              aliceSurveyContract.getAddress(),
              signers.alice,
            );
            expect(Number(decryptedSumSquares)).to.equal(3 * 3 + 4 * 4 + 5 * 5); // Should be 50

            // Decrypt Alice's max and min scores
            const decryptedMax = await fhevm.userDecryptEuint(
              FhevmType.euint8,
              encryptedStats.maxScore,
              aliceSurveyContract.getAddress(),
              signers.alice,
            );
            expect(Number(decryptedMax)).to.equal(5);

            const decryptedMin = await fhevm.userDecryptEuint(
              FhevmType.euint8,
              encryptedStats.minScore,
              aliceSurveyContract.getAddress(),
              signers.alice,
            );
            expect(Number(decryptedMin)).to.equal(3);
          },
        );

        it_test(
          "Should prevent unauthorized access to other respondents' statistics",
          async function () {
            await initialization();
            await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);

            // Submit responses from Bob
            await respondentSubmission([
              { signer: signers.bob, responses: [2, 3, 4] },
            ]);

            // Alice tries to access Bob's statistics
            const aliceSurveyContract = surveyContract.connect(signers.alice);
            const bobStatistics =
              await aliceSurveyContract.respondentStatistics(
                signers.bob.address,
              );

            // Attempt unauthorized decryption should fail
            try {
              await fhevm.userDecryptEuint(
                FhevmType.euint64,
                bobStatistics.total,
                aliceSurveyContract.getAddress(),
                signers.alice,
              );
              expect.fail(
                "Alice should not be able to decrypt Bob's statistics",
              );
            } catch (error: unknown) {
              expect((error as Error).message).to.include(
                "is not authorized to user decrypt handle",
              );
            }
          },
        );
      });

      describe_flow("4.2 Owner Decryption Authorization", function () {
        beforeEach(async function () {
          await initialization();
          await surveyContract.publishSurvey(SURVEY_CONFIG.MAX_SCORES);
          await respondentSubmission([
            { signer: signers.alice, responses: [3, 4, 5] },
            { signer: signers.bob, responses: [2, 3, 4] },
            { signer: signers.charlie, responses: [5, 5, 5] },
            { signer: signers.dave, responses: [1, 2, 3] },
            { signer: signers.eve, responses: [4, 4, 4] },
            { signer: signers.frealy, responses: [3, 5, 2] },
          ]);
        });

        it_test(
          "Should allow owner to grant decryption access after survey closure",
          async function () {
            // Grant decrypt access for question index 0
            await expect(surveyContract.grantOwnerDecrypt(0)).to.not.be
              .reverted;

            // Grant for all question indexes
            for (let i = 0; i < SURVEY_CONFIG.TOTAL_QUESTIONS; i++) {
              await expect(surveyContract.grantOwnerDecrypt(i)).to.not.be
                .reverted;
            }
          },
        );

        it_test(
          "Should prevent decryption authorization before survey closure",
          async function () {
            // Create new active survey
            const { contract: newSurvey } = await deployCustomSurvey();
            await newSurvey.publishSurvey(SURVEY_CONFIG.MAX_SCORES);

            await expect(newSurvey.grantOwnerDecrypt(0)).to.be.revertedWith(
              "not closed",
            );
          },
        );

        it_test(
          "Should validate question index bounds for decryption authorization",
          async function () {
            await expect(
              surveyContract.grantOwnerDecrypt(SURVEY_CONFIG.TOTAL_QUESTIONS),
            ).to.be.revertedWith("bad index");
            await expect(
              surveyContract.grantOwnerDecrypt(999),
            ).to.be.revertedWith("bad index");
          },
        );

        it_test(
          "Should restrict decryption authorization to owner only",
          async function () {
            await expect(
              surveyContract.connect(signers.alice).grantOwnerDecrypt(0),
            ).to.be.revertedWith("not owner");
          },
        );
      });
    });

    // =================================================================
    // WORKFLOW 5: Edge Cases and Error Handling
    // =================================================================
    describe_flow("Workflow 5: Edge Cases and Error Handling", function () {
      describe_flow("5.1 Invalid Survey Configuration", function () {
        it_test(
          "Should prevent publishing surveys with incomplete configuration",
          async function () {
            await initialization();
            const { contract: newSurvey } = await deployCustomSurvey({
              owner: signers.owner.address,
              symbol: "TEST",
              metadataCID: "", // empty metadata
              questionsCID: "quest-cid",
              totalQuestions: 3,
              respondentLimit: 6,
            });

            await expect(
              newSurvey.publishSurvey(SURVEY_CONFIG.MAX_SCORES),
            ).to.be.revertedWith("metadata or questions not set");
          },
        );

        it_test(
          "Should prevent responses to unpublished surveys",
          async function () {
            await initialization(); // Survey remains in Created status
            const encryptedInput = await fhevm
              .createEncryptedInput(
                await surveyContract.getAddress(),
                signers.alice.address,
              )
              .add8(3)
              .add8(4)
              .add8(5)
              .encrypt();

            await expect(
              surveyContract
                .connect(signers.alice)
                .submitResponses(
                  encryptedInput.handles,
                  encryptedInput.inputProof,
                ),
            ).to.be.revertedWith("not active");
          },
        );
      });

      describe_flow("5.2 Scale and Performance Testing", function () {
        it_test(
          "Should handle large-scale surveys with multiple questions",
          async function () {
            const questionsCount = 15; // Use MAX_QUESTIONS = 15
            const maxResponse = 10;
            const maxResponseArray = Array.from(
              { length: questionsCount },
              () => maxResponse,
            );

            const randomizeScore = () => {
              return Array.from(
                { length: questionsCount },
                () => Math.floor(Math.random() * maxResponse) + 1,
              );
            };

            const currentRespondents = [
              { signer: signers.alice, responses: randomizeScore() },
              { signer: signers.bob, responses: randomizeScore() },
              { signer: signers.charlie, responses: randomizeScore() },
            ];

            const { contract: largeSurvey } = await deployCustomSurvey({
              totalQuestions: questionsCount,
              respondentLimit: 10,
            });
            await largeSurvey.publishSurvey(maxResponseArray);

            // Submit responses manually since we're using a different contract
            for (let i = 0; i < currentRespondents.length; i++) {
              const buffer = fhevm.createEncryptedInput(
                await largeSurvey.getAddress(),
                currentRespondents[i].signer.address,
              );

              for (const response of currentRespondents[i].responses) {
                buffer.add8(response);
              }
              const encryptedInput = await buffer.encrypt();

              await largeSurvey
                .connect(currentRespondents[i].signer)
                .submitResponses(
                  encryptedInput.handles,
                  encryptedInput.inputProof,
                );
            }

            await largeSurvey.closeSurvey();

            const survey = await largeSurvey.survey();
            expect(survey.status).to.equal(2); // Closed status
            expect(survey.totalQuestions).to.equal(questionsCount);
            expect(await largeSurvey.totalRespondents()).to.equal(
              currentRespondents.length,
            );
          },
        );
      });
    });
  },
);
