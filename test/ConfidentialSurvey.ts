// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ethers, fhevm } from "hardhat";
// disable eslint
import { ConfidentialSurvey } from "../types/ConfidentialSurvey";
import { ConfidentialSurvey__factory } from "../types/factories/ConfidentialSurvey__factory";

type Signers = {
  owner: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
  dave: HardhatEthersSigner;
  eve: HardhatEthersSigner;
  stranger: HardhatEthersSigner;
};
const flow = describe;
const test = it;

type InitializationArgs = {
  owner?: string;
  symbol?: string;
  metadataCID?: string;
  questionsCID?: string;
  totalQuestions?: number;
  respondentLimit?: number;
};

flow("ConfidentialSurvey.sol", function () {
  let signers: Signers;
  let surveyContract: ConfidentialSurvey;
  // let surveyContractAddress: string; // Removed unused variable

  const SYMBOL = "SURV";
  const METADATA = "cid-meta";
  const QUESTIONS = "cid-quest";
  const TOTAL_Q = 3;
  const MAX_RESPONDENTS = 6;

  async function deployFixture() {
    const contractFactory = new ConfidentialSurvey__factory(signers.owner);
    const contract = await contractFactory.deploy();
    const contractAddress = await contract.getAddress();
    return { contract, contractAddress };
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
      stranger: ethSigners[6],
    };
  });

  beforeEach(async () => {
    ({ contract: surveyContract } = await deployFixture());
  });

  async function initialization(args: InitializationArgs = {}) {
    const default_config: InitializationArgs = {
      owner: signers.owner.address,
      symbol: SYMBOL,
      metadataCID: METADATA,
      questionsCID: QUESTIONS,
      totalQuestions: TOTAL_Q,
      respondentLimit: MAX_RESPONDENTS,
    };
    const usedConfig = {
      ...default_config,
      ...args,
    };
    await surveyContract.initialize(
      usedConfig.owner!,
      usedConfig.symbol!,
      usedConfig.metadataCID!,
      usedConfig.questionsCID!,
      usedConfig.totalQuestions!,
      usedConfig.respondentLimit!,
    );
  }

  flow("Fase Inisialisasi", function () {
    test("Berhasil menginisialisasi survey", async function () {
      await initialization();
      const survey = await surveyContract.getSurveyDetails();
      expect(survey.owner).to.equal(signers.owner.address);
      expect(survey.symbol).to.equal(SYMBOL);
      expect(survey.metadataCID).to.equal(METADATA);
      expect(survey.questionsCID).to.equal(QUESTIONS);
      expect(survey.totalQuestions).to.equal(TOTAL_Q);
      expect(survey.respondentLimit).to.equal(MAX_RESPONDENTS);
      expect(survey.status).to.equal(0); // 0 = Created
    });

    test("Berhasil menginisialisasi survey, meskipun metadata dan questions kosong", async function () {
      await initialization({
        metadataCID: "",
        questionsCID: "",
      });
      const survey = await surveyContract.getSurveyDetails();
      expect(survey.status).to.equal(0); // 0 = Created
    });

    test("gagal jika argumen saat inisialisasi salah", async function () {
      // Gagal jika respondentLimit lebih dari MAX_RESPONDENTS
      await expect(
        initialization({
          respondentLimit: 1001,
        }),
      ).to.be.revertedWith("bad respondentLimit");

      // Gagal jika respondentLimit kurang dari MIN_RESPONDENTS
      await expect(
        initialization({
          respondentLimit: 0,
        }),
      ).to.be.revertedWith("bad respondentLimit");

      // Gagal jika symbol kosong
      await expect(
        initialization({
          symbol: "",
        }),
      ).to.be.revertedWith("symbol length invalid");

      // Gagal jika symbol terlalu panjang
      await expect(
        initialization({
          symbol: "A".repeat(33), // Asumsi panjang maksimal 32 karakter
        }),
      ).to.be.revertedWith("symbol length invalid");
    });

    flow("Proses setelah inisialisasi survey", function () {
      beforeEach(async function () {
        await initialization();
      });

      test("Tidak bisa menginisialisasi ulang survey", async function () {
        await expect(
          initialization({
            owner: signers.alice.address, // mencoba ganti pemilik
            symbol: "NEW_SYMBOL", // mencoba ganti simbol
            metadataCID: "new-meta-cid",
          }),
        ).to.be.revertedWithCustomError(
          surveyContract,
          "InvalidInitialization",
        );
      });

      test("status survey harus Created", async function () {
        const survey = await surveyContract.getSurveyDetails();
        expect(survey.status).to.equal(0); // 0 = Created
      });

      test("harus emit event SurveyCreated", async function () {
        const filter = surveyContract.filters.SurveyCreated();
        const events = await surveyContract.queryFilter(filter);
        expect(events.length).to.be.greaterThan(0);
        const event = events[0];
        expect(event.args.owner).to.equal(signers.owner.address);
        expect(event.args.symbol).to.equal(SYMBOL);
      });
    });
  });

  flow(
    "Fase Persiapan. Owner bisa mengupdate metadata, questions, dan melakukan publish",
    function () {
      beforeEach(async function () {
        await initialization();
      });
      test("pemilik bisa update metadata dan questions", async function () {
        const newMetadataCID = "new-metadata-cid";
        const newQuestionsCID = "new-questions-cid";
        const newTotalQuestions = 5;
        await surveyContract.updateSurveyMetadata(newMetadataCID);
        await surveyContract.updateQuestions(
          newQuestionsCID,
          newTotalQuestions,
        );
        const survey = await surveyContract.getSurveyDetails();
        expect(survey.metadataCID).to.equal(newMetadataCID);
        expect(survey.questionsCID).to.equal(newQuestionsCID);
        expect(survey.totalQuestions).to.equal(newTotalQuestions);
      });

      test("bukan pemilik tidak bisa update metadata dan questions", async function () {
        await expect(
          surveyContract.connect(signers.alice).updateSurveyMetadata("new-cid"),
        ).to.be.revertedWith("not owner");

        await expect(
          surveyContract.connect(signers.alice).updateQuestions("new-cid", 5),
        ).to.be.revertedWith("not owner");
      });

      test("gagal update setelah publish", async function () {
        await surveyContract.publishSurvey([5, 5, 5]);
        await expect(
          surveyContract.updateSurveyMetadata("new-cid"),
        ).to.be.revertedWith("immutable state");
      });

      test("gagal update jika totalQuestions di luar rentang valid", async function () {
        await expect(
          surveyContract.updateQuestions("new-cid", 0),
        ).to.be.revertedWith("totalQuestions out of range");

        await expect(
          surveyContract.updateQuestions("new-cid", 1001),
        ).to.be.revertedWith("totalQuestions out of range");
      });

      test("gagal update jika metadataCID atau questionsCID kosong", async function () {
        await expect(
          surveyContract.updateSurveyMetadata(""),
        ).to.be.revertedWith("metadataCID cannot be empty");
        await expect(surveyContract.updateQuestions("", 5)).to.be.revertedWith(
          "questionsCID cannot be empty",
        );
      });

      test("Gagal update jika survey sudah dihapus", async function () {
        await surveyContract.deleteSurvey();
        await expect(
          surveyContract.updateSurveyMetadata("new-cid"),
        ).to.be.revertedWith("trashed");
        await expect(
          surveyContract.updateQuestions("new-cid", 5),
        ).to.be.revertedWith("trashed");
      });

      test("Emit event SurveyMetadataUpdated saat metadata diupdate", async function () {
        const newMetadataCID = "new-metadata-cid";
        await surveyContract.updateSurveyMetadata(newMetadataCID);
        const filter = surveyContract.filters.SurveyMetadataUpdated();
        const events = await surveyContract.queryFilter(filter);
        expect(events.length).to.be.greaterThan(0);
      });
    },
  );

  flow("Proses publikasi survey", function () {
    beforeEach(async function () {
      await initialization();
    });

    test("Berhasil mempublikasi survey", async function () {
      const maxScores = [5, 5, 5];
      await surveyContract.publishSurvey(maxScores);
    });
    test("gagal jika panjang array maxScores tidak sesuai", async function () {});

    test("gagal jika nilai maxScore tidak valid", async function () {
      // TODO: panggil publishSurvey dengan nilai di luar rentang -> expect revert
    });

    test("berhasil publish, status jadi Active, dan stats diinisialisasi", async function () {
      // TODO: publishSurvey dengan skor valid, cek status, event SurveyPublished
      // TODO: periksa questionStatistics awal (total=0, minScore==maxScore)
    });
  });

  flow("submitResponses", function () {
    beforeEach(async function () {
      // publish terlebih dahulu
      //   await survey.connect(owner).publishSurvey([5, 5, 5]);
    });

    test("responden submit responses valid dan update state", async function () {
      // TODO: buat encrypted + proofs, panggil submitResponses, cek event, hasResponded & totalRespondents
    });

    test("gagal jika panjang responses tidak sesuai", async function () {
      // TODO: expect revert untuk panjang array salah
    });

    test("menerapkan batas respondent dan auto-close saat limit tercapai", async function () {
      // TODO: submit MAX_RESPONDENTS kali, lalu submission berikutnya gagal atau auto-close
    });
  });

  flow("closeSurvey & deleteSurvey", function () {
    test("pemilik bisa close survey Active setelah minReached dan emit SurveyClosed", async function () {
      // TODO: publish, submit minimal satu response, closeSurvey, cek event & status
    });

    test("bukan pemilik tidak boleh close survey", async function () {
      // TODO: expect revert saat closeSurvey dari pihakLain
    });

    test("pemilik bisa delete survey saat tidak Active dan emit SurveyDeleted", async function () {
      // TODO: panggil deleteSurvey, cek event & status==Trashed
    });
  });

  flow("grantOwnerDecrypt", function () {
    beforeEach(async function () {
      // publish & close via cap
      //   await survey.connect(pemilik).publishSurvey([5, 5, 5]);
      // TODO: submit MAX_RESPONDENTS responses
    });

    test("gagal jika dipanggil sebelum Closed", async function () {
      // TODO: instance baru, panggil grantOwnerDecrypt -> expect revert
    });

    test("pemilik bisa grant decrypt setelah Closed", async function () {
      // TODO: panggil grantOwnerDecrypt untuk index valid, expect tidak revert
    });

    test("gagal jika index pertanyaan tidak valid", async function () {
      // TODO: expect revert dengan bad index
    });
  });
});
