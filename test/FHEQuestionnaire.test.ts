import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FHEQuestionnaire, FHEQuestionnaire__factory } from "../types";
import { ContractFactory } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import * as hre from "hardhat";

describe("FHEQuestionnaire", () => {
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner; // respondent1
  let bob: HardhatEthersSigner; // respondent2
  let stranger: HardhatEthersSigner; // non‑owner random
  let q: FHEQuestionnaire;
  let contractAddress: string;

  // Konfigurasi umum
  const title = "Kuesioner Penelitian";
  const scaleLimit = 5;
  const questionLimit = 3;
  const respondentLimit = 2;
  const metadata = "bafybeigdyrnatabcd123";

  // Nilai enum status (lihat urutan pada kontrak)
  enum Status {
    Initialized,
    Draft,
    Published,
    Closed,
    Trashed,
  }

  before(async () => {
    [owner, alice, bob, stranger] = await ethers.getSigners();
  });

  const deploy = async (
    ttl = title,
    scale = scaleLimit,
    qLimit = questionLimit,
    rLimit = respondentLimit,
    signer = owner,
  ) => {
    const contract = await new FHEQuestionnaire__factory(signer).deploy(
      ttl,
      scale,
      qLimit,
      rLimit,
    );
    contractAddress = await contract.getAddress();
    return contract;
  };

  beforeEach(async () => {
    q = await deploy();
  });

  /* -------------------------------------------------------------------------- */
  /*                              1. Constructor                                */
  /* -------------------------------------------------------------------------- */

  describe("Inisialisasi & Constructor", () => {
    let factory: ContractFactory;

    beforeEach(async () => {
      factory = await ethers.getContractFactory("FHEQuestionnaire");
    });

    it("Berhasil deploy dengan parameter valid", async () => {
      expect(await q.title()).to.equal(title);
      expect(await q.scaleLimit()).to.equal(scaleLimit);
      expect(await q.questionLimit()).to.equal(questionLimit);
      expect(await q.respondentLimit()).to.equal(respondentLimit);
      expect(await q.status()).to.equal(Status.Initialized);
    });

    it("Gagal deploy: judul kosong", async () => {
      await expect(deploy("")).to.be.revertedWithCustomError(
        factory,
        "InvalidTitle",
      );
    });

    it("Gagal deploy: scaleLimit di luar 2‑10", async () => {
      await expect(deploy(title, 1)).to.be.revertedWithCustomError(
        factory,
        "InvalidScale",
      );
      await expect(deploy(title, 11)).to.be.revertedWithCustomError(
        factory,
        "InvalidScale",
      );
    });

    it("Gagal deploy: questionLimit 0 atau > 20", async () => {
      await expect(deploy(title, scaleLimit, 0)).to.be.revertedWithCustomError(
        factory,
        "InvalidQuestionLimit",
      );
      await expect(deploy(title, scaleLimit, 21)).to.be.revertedWithCustomError(
        factory,
        "InvalidQuestionLimit",
      );
    });

    it("Gagal deploy: respondentLimit 0", async () => {
      await expect(
        deploy(title, scaleLimit, questionLimit, 0),
      ).to.be.revertedWithCustomError(factory, "InvalidRespondentLimit");
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                             2. Fungsi Metadata                             */
  /* -------------------------------------------------------------------------- */

  describe("Fungsi setMetadata", () => {
    it("Berhasil dipanggil owner saat status Initialized", async () => {
      await expect(q.setMetadata(metadata))
        .to.emit(q, "MetadataUpdated")
        .withArgs(metadata);
      expect(await q.metadataCID()).to.equal(metadata);
    });

    it("Gagal bila bukan owner", async () => {
      await expect(
        q.connect(stranger).setMetadata(metadata),
      ).to.be.revertedWithCustomError(q, "OnlyOwner");
    });

    it("Gagal bila status bukan Initialized", async () => {
      // ubah status ke Draft
      await q.addQuestions(["Q1"]);
      await expect(q.setMetadata(metadata)).to.be.revertedWithCustomError(
        q,
        "StatusNotInitialized",
      );
    });

    it("Gagal bila metadata kosong", async () => {
      await expect(q.setMetadata("")).to.be.revertedWithCustomError(
        q,
        "QuestionnaireMetadataCIDEmpty",
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                            3. Fungsi addQuestions                          */
  /* -------------------------------------------------------------------------- */

  describe("Fungsi addQuestions", () => {
    const questions = ["Pertanyaan 1", "Pertanyaan 2"];

    it("Berhasil menambahkan pertanyaan oleh owner", async () => {
      await expect(q.addQuestions(questions))
        .to.emit(q, "QuestionAdded")
        .withArgs(1, questions[0])
        .and.to.emit(q, "QuestionAdded")
        .withArgs(2, questions[1]);

      expect(await q.status()).to.equal(Status.Draft);
      expect(await q.totalQuestions()).to.equal(2);
      expect(await q.questions(1)).to.equal(questions[0]);
      expect(await q.questions(2)).to.equal(questions[1]);
    });

    it("Gagal menambahkan pertanyaan oleh non-owner", async () => {
      await expect(
        q.connect(stranger).addQuestions(questions),
      ).to.be.revertedWithCustomError(q, "OnlyOwner");
    });

    it("Gagal menambahkan pertanyaan melebihi questionLimit", async () => {
      const tooManyQuestions = Array(questionLimit + 1).fill("Pertanyaan");
      await expect(
        q.addQuestions(tooManyQuestions),
      ).to.be.revertedWithCustomError(q, "MaxQuestionsReached");
    });

    it("Gagal menambahkan pertanyaan kosong", async () => {
      await expect(q.addQuestions([""])).to.be.revertedWithCustomError(
        q,
        "EmptyQuestion",
      );
    });

    it("Gagal bila status bukan Initialized", async () => {
      // ubah status ke Draft
      await q.addQuestions(["Q1"]);
      await expect(q.addQuestions(["Q2"])).to.be.revertedWithCustomError(
        q,
        "StatusNotInitialized",
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           4. Manajemen Status                              */
  /* -------------------------------------------------------------------------- */

  describe("Manajemen Status", () => {
    beforeEach(async () => {
      // Add questions untuk test status transitions
      await q.addQuestions(["Q1", "Q2"]);
    });

    it("Berhasil mengubah status dari Draft ke Published", async () => {
      await expect(q.publish()).to.emit(q, "QuestionnairePublished");
      expect(await q.status()).to.equal(Status.Published);
    });

    it("Berhasil mengubah status dari Published ke Closed", async () => {
      await q.publish();
      await expect(q.closeQuestionnaire()).to.emit(q, "QuestionnaireClosed");
      expect(await q.status()).to.equal(Status.Closed);
    });

    it("Berhasil mengubah status ke Trashed dari Draft", async () => {
      await expect(q.deleteQuestionnaire()).to.emit(q, "QuestionnaireDeleted");
      expect(await q.status()).to.equal(Status.Trashed);
    });

    it("Gagal mengubah status oleh non-owner", async () => {
      await expect(q.connect(stranger).publish()).to.be.revertedWithCustomError(
        q,
        "OnlyOwner",
      );

      await q.publish();
      await expect(
        q.connect(stranger).closeQuestionnaire(),
      ).to.be.revertedWithCustomError(q, "OnlyOwner");
    });

    it("Gagal publish tanpa pertanyaan", async () => {
      const emptyQ = await deploy();
      await emptyQ.addQuestions([]); // status berubah ke Draft tapi tanpa pertanyaan
      await expect(emptyQ.publish()).to.be.revertedWithCustomError(
        emptyQ,
        "MustHaveQuestions",
      );
    });

    it("Gagal mengubah status dengan transisi yang tidak valid", async () => {
      // Tidak bisa publish dari Initialized
      const freshQ = await deploy();
      await expect(freshQ.publish()).to.be.revertedWithCustomError(
        freshQ,
        "StatusNotDraft",
      );

      // Tidak bisa close dari Draft
      await expect(q.closeQuestionnaire()).to.be.revertedWithCustomError(
        q,
        "StatusNotPublished",
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                      5. Fungsi Response/Jawaban (FHE)                      */
  /* -------------------------------------------------------------------------- */

  describe("Fungsi Response/Jawaban FHE", () => {
    let publishedQ: FHEQuestionnaire;

    beforeEach(async () => {
      // Setup published questionnaire
      publishedQ = await deploy();
      await publishedQ.addQuestions(["Q1", "Q2"]);
      await publishedQ.publish();
    });

    it("Berhasil mengirim respons pada kuesioner Published", async () => {
      // Check FHEVM mock environment
      if (!hre.fhevm.isMock) {
        console.log("Skipping FHE test - not in mock environment");
        return;
      }

      // Create encrypted responses using FHEVM
      const input = fhevm.createEncryptedInput(contractAddress, alice.address);
      input.add8(4); // Response 1: rating 4
      input.add8(5); // Response 2: rating 5
      const enc = await input.encrypt();

      const responses = [enc.handles[0], enc.handles[1]];
      const inputProof = enc.inputProof;

      await expect(
        publishedQ.connect(alice).submitResponses(responses, inputProof),
      ).to.emit(publishedQ, "ResponseSubmitted");

      expect(await publishedQ.totalRespondents()).to.equal(1);
    });

    it("Gagal mengirim respons pada kuesioner yang belum Published", async () => {
      const draftQ = await deploy();
      await draftQ.addQuestions(["Q1"]);

      // Mock encrypted responses
      const responses = [ethers.ZeroHash];
      const inputProof = "0x";

      await expect(
        draftQ.connect(alice).submitResponses(responses, inputProof),
      ).to.be.revertedWithCustomError(draftQ, "StatusNotPublished");
    });

    it("Gagal mengirim respons melebihi respondentLimit", async () => {
      if (!hre.fhevm.isMock) {
        console.log("Skipping FHE test - not in mock environment");
        return;
      }

      // Create questionnaire with very small limit for testing
      const limitedQ = await deploy(title, scaleLimit, questionLimit, 1); // limit to 1 respondent
      await limitedQ.addQuestions(["Q1", "Q2"]);
      await limitedQ.publish();

      // Submit first response (should succeed)
      const input1 = fhevm.createEncryptedInput(contractAddress, alice.address);
      input1.add8(3); // Q1
      input1.add8(4); // Q2
      const enc1 = await input1.encrypt();

      await limitedQ
        .connect(alice)
        .submitResponses([enc1.handles[0], enc1.handles[1]], enc1.inputProof);

      // Now questionnaire should be closed
      expect(await limitedQ.status()).to.equal(Status.Closed);

      // Try to submit second response (should fail as it's now closed)
      const input2 = fhevm.createEncryptedInput(contractAddress, bob.address);
      input2.add8(2);
      input2.add8(3);
      const enc2 = await input2.encrypt();

      await expect(
        limitedQ
          .connect(bob)
          .submitResponses([enc2.handles[0], enc2.handles[1]], enc2.inputProof),
      ).to.be.revertedWithCustomError(limitedQ, "StatusNotPublished");
    });

    it("Gagal mengirim respons duplikat dari address yang sama", async () => {
      if (!hre.fhevm.isMock) {
        console.log("Skipping FHE test - not in mock environment");
        return;
      }

      // First submission
      const input1 = fhevm.createEncryptedInput(contractAddress, alice.address);
      input1.add8(4);
      input1.add8(5);
      const enc1 = await input1.encrypt();

      await publishedQ
        .connect(alice)
        .submitResponses([enc1.handles[0], enc1.handles[1]], enc1.inputProof);

      // Second submission (should fail)
      const input2 = fhevm.createEncryptedInput(contractAddress, alice.address);
      input2.add8(3);
      input2.add8(4);
      const enc2 = await input2.encrypt();

      await expect(
        publishedQ
          .connect(alice)
          .submitResponses([enc2.handles[0], enc2.handles[1]], enc2.inputProof),
      ).to.be.revertedWithCustomError(publishedQ, "AlreadyResponded");
    });

    it("Gagal owner mengirim respons", async () => {
      if (!hre.fhevm.isMock) {
        console.log("Skipping FHE test - not in mock environment");
        return;
      }

      const input = fhevm.createEncryptedInput(contractAddress, owner.address);
      input.add8(4);
      input.add8(5);
      const enc = await input.encrypt();

      await expect(
        publishedQ
          .connect(owner)
          .submitResponses([enc.handles[0], enc.handles[1]], enc.inputProof),
      ).to.be.revertedWithCustomError(publishedQ, "NotForOwner");
    });

    it("Gagal dengan jumlah respons yang tidak sesuai", async () => {
      if (!hre.fhevm.isMock) {
        console.log("Skipping FHE test - not in mock environment");
        return;
      }

      // Only one response for two questions
      const input = fhevm.createEncryptedInput(contractAddress, alice.address);
      input.add8(4);
      const enc = await input.encrypt();

      await expect(
        publishedQ
          .connect(alice)
          .submitResponses([enc.handles[0]], enc.inputProof),
      ).to.be.revertedWithCustomError(publishedQ, "ResponseCountMismatch");
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                      6. Fungsi Akses dan Keamanan                          */
  /* -------------------------------------------------------------------------- */

  describe("Fungsi Akses dan Keamanan", () => {
    it("Owner dapat mengakses semua fungsi owner-only", async () => {
      await expect(q.setMetadata(metadata)).to.not.be.reverted;
      await expect(q.addQuestions(["Q1"])).to.not.be.reverted;
      await expect(q.publish()).to.not.be.reverted;
      await expect(q.closeQuestionnaire()).to.not.be.reverted;
    });

    it("Non-owner tidak dapat mengakses fungsi owner-only", async () => {
      await expect(
        q.connect(stranger).setMetadata(metadata),
      ).to.be.revertedWithCustomError(q, "OnlyOwner");

      await expect(
        q.connect(stranger).addQuestions(["Q1"]),
      ).to.be.revertedWithCustomError(q, "OnlyOwner");
    });

    it("Semua user dapat mengakses fungsi view public", async () => {
      await q.addQuestions(["Q1", "Q2"]);

      expect(await q.connect(stranger).title()).to.equal(title);
      expect(await q.connect(stranger).scaleLimit()).to.equal(scaleLimit);
      expect(await q.connect(stranger).totalQuestions()).to.equal(2);
      expect(await q.connect(stranger).status()).to.equal(Status.Draft);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           7. Event dan Logging                             */
  /* -------------------------------------------------------------------------- */

  describe("Event dan Logging", () => {
    it("Event QuestionnaireCreated terpancar saat constructor", async () => {
      const newQ = await deploy();

      // Check creation event in transaction receipt
      const deploymentTx = newQ.deploymentTransaction();
      if (deploymentTx) {
        const receipt = await deploymentTx.wait();
        const events = receipt?.logs.map((log) => newQ.interface.parseLog(log));
        const creationEvent = events?.find(
          (e) => e?.name === "QuestionnaireCreated",
        );
        expect(creationEvent).to.not.equal(undefined);
      }
    });

    it("Event MetadataUpdated terpancar saat set metadata", async () => {
      await expect(q.setMetadata(metadata))
        .to.emit(q, "MetadataUpdated")
        .withArgs(metadata);
    });

    it("Event QuestionAdded terpancar saat menambah pertanyaan", async () => {
      const question = "Test Question";
      await expect(q.addQuestions([question]))
        .to.emit(q, "QuestionAdded")
        .withArgs(1, question);
    });

    it("Event untuk perubahan status terpancar dengan benar", async () => {
      await q.addQuestions(["Q1"]);

      await expect(q.publish()).to.emit(q, "QuestionnairePublished");

      await expect(q.closeQuestionnaire()).to.emit(q, "QuestionnaireClosed");
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                        8. Fungsi Getter dan View                           */
  /* -------------------------------------------------------------------------- */

  describe("Fungsi Getter dan View", () => {
    beforeEach(async () => {
      await q.addQuestions(["Q1", "Q2", "Q3"]);
    });

    it("getAllQuestions mengembalikan daftar pertanyaan yang benar", async () => {
      const allQuestions = await q.getAllQuestions();
      expect(allQuestions).to.deep.equal(["Q1", "Q2", "Q3"]);
    });

    it("getStatus mengembalikan status yang tepat", async () => {
      expect(await q.getStatus()).to.equal(Status.Draft);

      await q.publish();
      expect(await q.getStatus()).to.equal(Status.Published);
    });

    it("getQuestionnaireStatistics mengembalikan statistik yang benar", async () => {
      await q.publish();

      const [respondents, questionsCount, slotsRemaining] =
        await q.getQuestionnaireStatistics();
      expect(respondents).to.equal(0);
      expect(questionsCount).to.equal(3);
      expect(slotsRemaining).to.equal(respondentLimit);
    });

    it("getUserResponses gagal untuk user yang belum merespons", async () => {
      await q.publish();

      await expect(
        q.getUserResponses(alice.address),
      ).to.be.revertedWithCustomError(q, "UserHasNotResponded");
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                       9. Edge Cases dan Error Handling                     */
  /* -------------------------------------------------------------------------- */

  describe("Edge Cases dan Error Handling", () => {
    it("Handling operasi dengan questionLimit maksimal", async () => {
      const maxQuestions = Array(questionLimit)
        .fill("placeholder")
        .map((_, i) => `Question ${i + 1}`);
      await expect(q.addQuestions(maxQuestions)).to.not.be.reverted;
      expect(await q.totalQuestions()).to.equal(questionLimit);
    });

    it("Handling ID pertanyaan yang tidak valid", async () => {
      await q.addQuestions(["Q1"]);
      await q.publish();

      await expect(q.getQuestionAverage(0)).to.be.revertedWithCustomError(
        q,
        "InvalidQuestionId",
      );

      await expect(q.getQuestionAverage(999)).to.be.revertedWithCustomError(
        q,
        "InvalidQuestionId",
      );
    });

    it("Handling statistik pada kuesioner tanpa responden", async () => {
      await q.addQuestions(["Q1"]);
      await q.publish();

      // getQuestionAverage is not a view function, so we test that it doesn't revert
      await expect(q.getQuestionAverage(1)).to.not.be.reverted;
    });

    it("Handling status questionnaire yang sudah di-trash", async () => {
      await q.addQuestions(["Q1"]);
      await q.deleteQuestionnaire();

      // Most operations should fail on trashed questionnaire
      await expect(q.setMetadata(metadata)).to.be.revertedWithCustomError(
        q,
        "StatusNotInitialized",
      );
    });

    it("Tidak dapat menghapus kuesioner yang sudah Published/Closed", async () => {
      await q.addQuestions(["Q1"]);
      await q.publish();

      await expect(q.deleteQuestionnaire()).to.be.revertedWithCustomError(
        q,
        "CannotBeDeleted",
      );

      await q.closeQuestionnaire();
      await expect(q.deleteQuestionnaire()).to.be.revertedWithCustomError(
        q,
        "CannotBeDeleted",
      );
    });
  });
});
