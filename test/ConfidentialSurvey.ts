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
  frealy: HardhatEthersSigner;
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

type RespondentSubmission = {
  signer: HardhatEthersSigner;
  responses: number[];
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
      const survey = await surveyContract.survey();
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
      const survey = await surveyContract.survey();
      expect(survey.status).to.equal(0); // 0 = Created
    });

    test("Gagal jika argumen saat inisialisasi salah", async function () {
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
        const survey = await surveyContract.survey();
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

  flow("Fase update metadata dan questions", function () {
    beforeEach(async function () {
      await initialization();
    });
    test("pemilik bisa update metadata dan questions", async function () {
      const newMetadataCID = "new-metadata-cid";
      const newQuestionsCID = "new-questions-cid";
      const newTotalQuestions = 5;
      await surveyContract.updateSurveyMetadata(newMetadataCID);
      await surveyContract.updateQuestions(newQuestionsCID, newTotalQuestions);
      const survey = await surveyContract.survey();
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

    test("Gagal update setelah publish", async function () {
      await surveyContract.publishSurvey([5, 5, 5]);
      await expect(
        surveyContract.updateSurveyMetadata("new-cid"),
      ).to.be.revertedWith("immutable state");
    });

    test("Gagal update jika totalQuestions di luar rentang valid", async function () {
      await expect(
        surveyContract.updateQuestions("new-cid", 0),
      ).to.be.revertedWith("totalQuestions out of range");

      await expect(
        surveyContract.updateQuestions("new-cid", 1001),
      ).to.be.revertedWith("totalQuestions out of range");
    });

    test("Gagal update jika metadataCID atau questionsCID kosong", async function () {
      await expect(surveyContract.updateSurveyMetadata("")).to.be.revertedWith(
        "metadataCID cannot be empty",
      );
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
  });

  flow("Proses publikasi survey", function () {
    beforeEach(async function () {
      await initialization();
    });

    test("Berhasil mempublikasi survey", async function () {
      const maxScores = [5, 5, 5];
      await surveyContract.publishSurvey(maxScores);
      //   Cek bahwa survey sudah dipublikasikan
      const survey = await surveyContract.survey();
      expect(survey.status).to.equal(1); // 1 = Active
    });

    test("Berhasil publish, status jadi Active, dan stats diinisialisasi", async function () {
      const maxScores = [5, 8, 10];
      await surveyContract.publishSurvey(maxScores);

      // Cek status berubah menjadi Active
      const survey = await surveyContract.survey();
      expect(survey.status).to.equal(1); // 1 = Active

      // Cek event SurveyPublished dipancarkan
      const filter = surveyContract.filters.SurveyPublished();
      const events = await surveyContract.queryFilter(filter);
      expect(events[0].fragment.name).to.eq("SurveyPublished");
    });

    test("Berhasil publish dan question statistics terinisialisasi", async function () {
      const maxScores = [5, 5, 5];
      // question statistics belum diinisialisasi
      for (let i = 0; i < maxScores.length; i++) {
        const encryptedStats = await surveyContract.questionStatistics(i);
        const [total, sumSquares, max, min] = encryptedStats;
        expect(total).to.eq(ethers.ZeroHash);
        expect(sumSquares).to.eq(ethers.ZeroHash);
        expect(max).to.eq(ethers.ZeroHash);
        expect(min).to.eq(ethers.ZeroHash);

        for (let j = 1; j <= maxScores[i]; j++) {
          const frequency = await surveyContract.frequencyCounts(i, j);
          expect(frequency).to.eq(ethers.ZeroHash);
        }
      }

      // Publish survey
      await surveyContract.publishSurvey(maxScores);
      // Cek bahwa statistics untuk setiap pertanyaan sudah diinisialisasi
      for (let i = 0; i < maxScores.length; i++) {
        const encryptedStats = await surveyContract.questionStatistics(i);
        const [total, sumSquares, max, min] = encryptedStats;
        expect(total).not.eq(ethers.ZeroHash);
        expect(sumSquares).not.eq(ethers.ZeroHash);
        expect(max).not.eq(ethers.ZeroHash);
        expect(min).not.eq(ethers.ZeroHash);

        for (let j = 1; j <= maxScores[i]; j++) {
          const frequency = await surveyContract.frequencyCounts(i, j);
          expect(frequency).not.eq(ethers.ZeroHash);
        }
      }
    });

    test("Gagal jika panjang array maxScores tidak sesuai", async function () {
      const maxScores = [5, 5]; // Hanya 2 skor, tapi totalQuestions = 3
      await expect(surveyContract.publishSurvey(maxScores)).to.be.revertedWith(
        "length mismatch",
      );
    });

    test("Gagal jika nilai maxScore tidak valid", async function () {
      // Test dengan nilai terlalu kecil (minimum adalah 2)
      await expect(surveyContract.publishSurvey([1, 5, 5])).to.be.revertedWith(
        "maxScore out of range",
      );
      // Test dengan nilai terlalu besar (maksimum adalah 10)
      await expect(surveyContract.publishSurvey([11, 5, 5])).to.be.revertedWith(
        "maxScore out of range",
      );
    });

    test("Gagal publish jika metadataCID atau questionsCID kosong", async function () {
      ({ contract: surveyContract } = await deployFixture());
      await surveyContract.initialize(
        signers.owner.address,
        SYMBOL,
        "", // metadataCID kosong
        QUESTIONS,
        TOTAL_Q,
        MAX_RESPONDENTS,
      );
      await expect(surveyContract.publishSurvey([5, 5, 5])).to.be.revertedWith(
        "metadata or questions not set",
      );

      ({ contract: surveyContract } = await deployFixture());
      await surveyContract.initialize(
        signers.owner.address,
        SYMBOL,
        METADATA,
        "", // questionsCID kosong
        TOTAL_Q,
        MAX_RESPONDENTS,
      );
      await expect(surveyContract.publishSurvey([5, 5, 5])).to.be.revertedWith(
        "metadata or questions not set",
      );

      ({ contract: surveyContract } = await deployFixture());
      await surveyContract.initialize(
        signers.owner.address,
        SYMBOL,
        METADATA,
        "", // questionsCID kosong
        TOTAL_Q,
        MAX_RESPONDENTS,
      );
      await expect(surveyContract.publishSurvey([5, 5, 5])).to.be.revertedWith(
        "metadata or questions not set",
      );
    });

    test("Gagal publish jika survey sudah dihapus", async function () {
      await surveyContract.deleteSurvey();
      await expect(surveyContract.publishSurvey([5, 5, 5])).to.be.revertedWith(
        "trashed",
      );
    });

    test("Gagal publish jika survey sudah dipublish", async function () {
      await surveyContract.publishSurvey([5, 5, 5]);
      await expect(surveyContract.publishSurvey([5, 5, 5])).to.be.revertedWith(
        "already active",
      );
    });

    test("Gagal jika respondent lain mencoba publish survey", async function () {
      await expect(
        surveyContract.connect(signers.alice).publishSurvey([5, 5, 5]),
      ).to.be.revertedWith("not owner");
    });
  });

  flow("Proses saat user mengisi survei", function () {
    beforeEach(async function () {
      await initialization();
      // Publish survey terlebih dahulu
      await surveyContract.publishSurvey([5, 5, 5]);
    });

    test("responden submit responses valid dan update state", async function () {
      // Buat encrypted responses menggunakan FHEVM
      const responses = [3, 4, 5]; // Plain responses
      const buffer = fhevm.createEncryptedInput(
        await surveyContract.getAddress(),
        signers.alice.address,
      );
      for (const response of responses) {
        buffer.add8(response);
      }
      const encrypted = await buffer.encrypt();
      // Submit responses dari Alice
      await surveyContract
        .connect(signers.alice)
        .submitResponses(encrypted.handles, encrypted.inputProof);

      // Cek event ResponsesSubmitted dipancarkan
      const filter = surveyContract.filters.ResponsesSubmitted();
      const events = await surveyContract.queryFilter(filter);
      expect(events[0].eventName).to.be.equal("ResponsesSubmitted");

      // Cek bahwa Alice sudah merespons dan totalRespondents bertambah
      const survey = await surveyContract.survey();
      expect(survey.status).to.equal(1); // Masih Active
    });

    test("Gagal jika panjang responses tidak sesuai", async function () {
      // Buat hanya 2 encrypted responses padahal ada 3 pertanyaan
      const responses = [3, 4];

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
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("wrong responses len");
    });

    test("Gagal jika owner mencoba submit responses", async function () {
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
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("owner not allowed");
    });

    test("Gagal jika responden sudah pernah submit", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(
          await surveyContract.getAddress(),
          signers.alice.address,
        )
        .add8(3)
        .add8(4)
        .add8(5)
        .encrypt();

      // Submit pertama kali
      await surveyContract
        .connect(signers.alice)
        .submitResponses(encryptedInput.handles, encryptedInput.inputProof);

      // Submit kedua kali dari Alice yang sama
      await expect(
        surveyContract
          .connect(signers.alice)
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("already responded");
    });

    flow("Validasi setelah submitResponses", function () {
      beforeEach(async function () {
        // 6 respondents, masing-masing submit responses
        // Submit responses dari 6 respondents (sesuai MAX_RESPONDENTS)
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
            .submitResponses(encryptedInput.handles, encryptedInput.inputProof);
        }
      });

      test("Auto-close saat limit tercapai", async function () {
        // Survey harus auto-close setelah mencapai limit
        const survey = await surveyContract.survey();
        expect(survey.status).to.equal(2); // 2 = Closed

        // Cek event SurveyClosed dipancarkan
        const filter = surveyContract.filters.SurveyClosed();
        const events = await surveyContract.queryFilter(filter);
        expect(events[0].eventName).to.be.equal("SurveyClosed");
      });

      test("Gagal jika survey tidak dalam status Active", async function () {
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
            .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
        ).to.be.revertedWith("not active");
      });
    });
  });

  flow("Close dan Delete Survey", function () {
    beforeEach(async function () {
      await initialization();
      await surveyContract.publishSurvey([5, 5, 5]);
    });

    test("pemilik bisa close survey Active setelah minReached dan emit SurveyClosed", async function () {
      // Submit minimal satu response untuk memenuhi MIN_RESPONDENTS
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

      // Close survey
      await surveyContract.closeSurvey();

      // Cek status berubah menjadi Closed
      const survey = await surveyContract.survey();
      expect(survey.status).to.equal(2); // 2 = Closed

      // Cek event SurveyClosed dipancarkan
      const filter = surveyContract.filters.SurveyClosed();
      const events = await surveyContract.queryFilter(filter);
      expect(events.length).to.be.greaterThan(0);
      expect(events[0].args.totalRespondents).to.equal(1);
    });

    test("bukan pemilik tidak boleh close survey", async function () {
      // Submit minimal satu response
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

      // Alice mencoba close survey
      await expect(
        surveyContract.connect(signers.alice).closeSurvey(),
      ).to.be.revertedWith("not owner");
    });

    test("Gagal close survey jika belum mencapai minimum respondents", async function () {
      // Tanpa submit response, langsung close
      await expect(surveyContract.closeSurvey()).to.be.revertedWith(
        "min not reached",
      );
    });

    test("pemilik bisa delete survey saat tidak Active dan emit SurveyDeleted", async function () {
      // Buat survey baru dalam status Created (tidak active)
      const { contract: newSurvey } = await deployFixture();
      await newSurvey.initialize(
        signers.owner.address,
        "TEST",
        "meta-cid",
        "quest-cid",
        3,
        6,
      );

      // Delete survey
      await newSurvey.deleteSurvey();

      // Cek status berubah menjadi Trashed
      const survey = await newSurvey.survey();
      expect(survey.status).to.equal(3); // 3 = Trashed

      // Cek event SurveyDeleted dipancarkan
      const filter = newSurvey.filters.SurveyDeleted();
      const events = await newSurvey.queryFilter(filter);
      expect(events.length).to.be.greaterThan(0);
    });

    test("Gagal delete survey jika sedang Active", async function () {
      // Survey sudah dalam status Active dari beforeEach
      await expect(surveyContract.deleteSurvey()).to.be.revertedWith(
        "already active",
      );
    });
  });

  flow("Dekripsi general statistik", function () {
    beforeEach(async function () {
      await initialization();
      await surveyContract.publishSurvey([5, 5, 5]);
      await respondentSubmission([
        {
          signer: signers.alice,
          responses: [3, 4, 5],
        },
        {
          signer: signers.bob,
          responses: [2, 3, 4],
        },
        {
          signer: signers.charlie,
          responses: [5, 5, 5],
        },
        {
          signer: signers.dave,
          responses: [1, 2, 3],
        },
        {
          signer: signers.eve,
          responses: [4, 4, 4],
        },
        {
          signer: signers.frealy,
          responses: [3, 5, 2],
        },
      ]);
    });

    test("Pemilik bisa grant decrypt setelah Closed", async function () {
      // Panggil grantOwnerDecrypt untuk question index 0
      await expect(surveyContract.grantOwnerDecrypt(0)).to.not.be.reverted;

      // Panggil untuk semua question indexes
      for (let i = 0; i < 3; i++) {
        await expect(surveyContract.grantOwnerDecrypt(i)).to.not.be.reverted;
      }
    });

    test("Gagal jika dipanggil sebelum Closed", async function () {
      // Buat survey baru yang masih Active
      const { contract: newSurvey } = await deployFixture();
      await newSurvey.initialize(
        signers.owner.address,
        "TEST",
        "meta-cid",
        "quest-cid",
        3,
        6,
      );
      await newSurvey.publishSurvey([5, 5, 5]);

      await expect(newSurvey.grantOwnerDecrypt(0)).to.be.revertedWith(
        "not closed",
      );
    });

    test("Gagal jika index pertanyaan tidak valid", async function () {
      // Index 3 tidak valid karena hanya ada 3 pertanyaan (index 0-2)
      await expect(surveyContract.grantOwnerDecrypt(3)).to.be.revertedWith(
        "bad index",
      );

      // Index yang sangat besar
      await expect(surveyContract.grantOwnerDecrypt(999)).to.be.revertedWith(
        "bad index",
      );
    });

    test("Bukan pemilik tidak bisa grant decrypt", async function () {
      await expect(
        surveyContract.connect(signers.alice).grantOwnerDecrypt(0),
      ).to.be.revertedWith("not owner");
    });
  });

  flow("FHEVM Decryption and Statistics", function () {
    async function initialStep() {
      await initialization();
      const maxScores = [5, 5, 5];
      await surveyContract.publishSurvey(maxScores);
      const currentRespondents = [
        {
          signer: signers.alice,
          responses: [3, 4, 5],
        },
        {
          signer: signers.bob,
          responses: [2, 3, 4],
        },
        {
          signer: signers.charlie,
          responses: [5, 5, 5],
        },
      ];
      await respondentSubmission(currentRespondents);

      const expectedStats = {
        questions: {
          total: maxScores.map((_, i) => {
            return currentRespondents
              .map((r) => r.responses[i])
              .reduce((a, b) => a + b, 0); // Total score per question
          }),
          sumSquares: maxScores.map((_, i) => {
            return currentRespondents
              .map((r) => r.responses[i] ** 2)
              .reduce((a, b) => a + b, 0); // Sum of squares per question
          }),
          maxScore: maxScores.map((_, i) => {
            return Math.max(...currentRespondents.map((r) => r.responses[i])); // Max score per question
          }),
          minScore: maxScores.map((_, i) => {
            return Math.min(...currentRespondents.map((r) => r.responses[i])); // Min score per question
          }),
        },
        respondentScores: currentRespondents.map((r) => ({
          total: r.responses.reduce((a, b) => a + b, 0), // Total score for respondent
          sumSquares: r.responses.reduce((a, b) => a + b ** 2, 0), // Sum of squares for respondent
          maxScore: Math.max(...r.responses), // Max score for respondent
          minScore: Math.min(...r.responses), // Min score for respondent
        })),
      };
      return expectedStats;
    }

    test("Owner dapat mendecrypt statistik setelah grant access", async function () {
      const { questions } = await initialStep();
      await surveyContract.closeSurvey();

      // Verify survey status is Closed
      const survey = await surveyContract.survey();
      expect(Number(survey.status)).to.equal(2); // Survey tetap Closed

      // Grant owner decrypt access untuk setiap pertanyaan
      for (let i = 0; i < Number(survey.totalQuestions); i++) {
        await expect(surveyContract.grantOwnerDecrypt(i)).to.not.be.reverted;

        // request decryption untuk pertanyaan i
        const encryptedStats = await surveyContract.questionStatistics(i);
        const decryptedTotal = await fhevm.userDecryptEuint(
          FhevmType.euint64,
          encryptedStats.total,
          surveyContract.getAddress(),
          signers.owner,
        );
        expect(Number(decryptedTotal)).to.equal(questions.total[i]);

        const decryptedSumSquares = await fhevm.userDecryptEuint(
          FhevmType.euint64,
          encryptedStats.sumSquares,
          surveyContract.getAddress(),
          signers.owner,
        );
        expect(Number(decryptedSumSquares)).to.equal(questions.sumSquares[i]);

        const decryptedMax = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          encryptedStats.maxScore,
          surveyContract.getAddress(),
          signers.owner,
        );
        expect(Number(decryptedMax)).to.equal(questions.maxScore[i]);

        const decryptedMin = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          encryptedStats.minScore,
          surveyContract.getAddress(),
          signers.owner,
        );
        expect(Number(decryptedMin)).to.equal(questions.minScore[i]);
      }
    });

    test("respondent dapat access statistik mereka sendiri saat survey aktif", async function () {
      // Inisialisasi dan publish survey
      await initialization();
      const maxScores = [5, 5, 5];
      await surveyContract.publishSurvey(maxScores);
      // Submit responses dari Alice
      await respondentSubmission([
        {
          signer: signers.alice,
          responses: [3, 4, 5],
        },
      ]);

      /// alice connect ke surveyContract
      const aliceSurveyContract = surveyContract.connect(signers.alice);
      // Mendapatkan total score Alice
      const encryptedStats = await aliceSurveyContract.respondentStatistics(
        signers.alice.address,
      );
      const decryptedTotal = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedStats.total,
        aliceSurveyContract.getAddress(),
        signers.alice,
      );
      expect(Number(decryptedTotal)).to.equal(3 + 4 + 5);

      // Mendapatkan sum of squares Alice
      const decryptedSumSquares = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedStats.sumSquares,
        aliceSurveyContract.getAddress(),
        signers.alice,
      );
      expect(Number(decryptedSumSquares)).to.equal(3 ** 2 + 4 ** 2 + 5 ** 2);
      // Mendapatkan max score Alice
      const decryptedMax = await fhevm.userDecryptEuint(
        FhevmType.euint8,
        encryptedStats.maxScore,
        aliceSurveyContract.getAddress(),
        signers.alice,
      );
      expect(Number(decryptedMax)).to.equal(5);
      // Mendapatkan min score Alice
      const decryptedMin = await fhevm.userDecryptEuint(
        FhevmType.euint8,
        encryptedStats.minScore,
        aliceSurveyContract.getAddress(),
        signers.alice,
      );
      expect(Number(decryptedMin)).to.equal(3);
    });

    // Alice tidak dapat mengakses statistik orang lain
    test("respondent tidak dapat mengakses statistik responden lain", async function () {
      // Inisialisasi dan publish survey
      await initialization();
      const maxScores = [5, 5, 5];
      await surveyContract.publishSurvey(maxScores);
      // Submit responses dari Bob
      await respondentSubmission([
        {
          signer: signers.bob,
          responses: [2, 3, 4],
        },
      ]);
      // Alice mencoba mengakses statistik Bob
      const aliceSurveyContract = surveyContract.connect(signers.alice);
      const bobStatistics = await aliceSurveyContract.respondentStatistics(
        signers.bob.address,
      );

      // Gunakan try-catch untuk menangkap error dekripsi
      try {
        await fhevm.userDecryptEuint(
          FhevmType.euint64,
          bobStatistics.total,
          aliceSurveyContract.getAddress(),
          signers.alice,
        );
        // Jika tidak error, test gagal
        expect.fail("Alice seharusnya tidak bisa mendekripsi statistik Bob");
      } catch (error: unknown) {
        // Verify bahwa error adalah tentang unauthorized decryption
        expect((error as Error).message).to.include(
          "is not authorized to user decrypt handle",
        );
      }
    });
  });

  flow("Edge Cases dan Error Handling", function () {
    test("Gagal publish survey tanpa metadata atau questions", async function () {
      await initialization();
      const { contract: newSurvey } = await deployFixture();
      await newSurvey.initialize(
        signers.owner.address,
        "TEST",
        "", // metadata kosong
        "quest-cid",
        3,
        6,
      );

      await expect(newSurvey.publishSurvey([5, 5, 5])).to.be.revertedWith(
        "metadata or questions not set",
      );
    });

    test("Gagal submit responses ke survey yang belum dipublish", async function () {
      await initialization(); // Survey masih dalam status Created
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
          .submitResponses(encryptedInput.handles, encryptedInput.inputProof),
      ).to.be.revertedWith("not active");
    });
  });

  flow("Frequency Counts", function () {
    beforeEach(async function () {
      await initialization({
        totalQuestions: 10,
        respondentLimit: 100,
      });
      await surveyContract.publishSurvey([5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    });
    test("Pemilik dapat mendapatkan frequency counts untuk setiap pertanyaan", async function () {
      const currentRespondents = [
        {
          signer: signers.alice,
          responses: [4, 1, 3, 2, 5, 3, 4, 5, 2, 1],
        },
        // {
        //   signer: signers.bob,
        //   responses: [5, 2, 1, 4, 3, 2, 5, 4, 1, 3],
        // },
        // {
        //   signer: signers.charlie,
        //   responses: [1, 2, 5, 3, 4, 2, 1, 5, 4, 3],
        // },
        // {
        //   signer: signers.dave,
        //   responses: [2, 4, 5, 1, 3, 2, 5, 4, 1, 3],
        // },
        // {
        //   signer: signers.eve,
        //   responses: [4, 3, 1, 2, 5, 3, 4, 5, 2, 1],
        // },
        // {
        //   signer: signers.frealy,
        //   responses: [1, 3, 2, 5, 4, 2, 1, 3, 4, 5],
        // },
      ];
      await respondentSubmission(currentRespondents);
      await surveyContract.closeSurvey();
      const survey = await surveyContract.survey();
      const expectedFrequencies: number[][] = [];
      for (let i = 0; i < Number(survey.totalQuestions); i++) {
        await surveyContract.grantOwnerDecrypt(i);
        const qResponses = currentRespondents.map((r) => r.responses[i]);
        expectedFrequencies[i] = []; // Inisialisasi array di sini
        for (let j = 1; j <= 5; j++) {
          const frequency = qResponses.filter((r) => r === j).length;
          expectedFrequencies[i][j - 1] = frequency; // Simpan frekuensi untuk skor j
        }
      }

      for (let i = 0; i < Number(survey.totalQuestions); i++) {
        console.log("Question index:", i);
        for (let j = 1; j <= 5; j++) {
          const frequency = await surveyContract.frequencyCounts(i, j);
          console.log(`- Frequency for question ${i}, score ${j}:`);
          const decryptedFrequency = await fhevm.userDecryptEuint(
            FhevmType.euint64,
            frequency,
            surveyContract.getAddress(),
            signers.owner,
          );
          console.log("Expected: ", expectedFrequencies[i][j - 1]);
          console.log("Actual: ", decryptedFrequency.toString());
          expect(Number(decryptedFrequency)).to.equal(
            expectedFrequencies[i][j - 1],
          );
        }
      }
    });
  });
});
