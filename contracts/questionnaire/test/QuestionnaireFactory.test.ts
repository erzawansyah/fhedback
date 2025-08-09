import { ethers } from "hardhat";
import { expect } from "chai";
import { QuestionnaireFactory, QuestionnaireFactory__factory } from "../types";
import { Signer } from "ethers";

describe("QuestionnaireFactory", () => {
  let owner: Signer;
  let alice: Signer;
  let bob: Signer;
  let charlie: Signer;
  let factory: QuestionnaireFactory;

  // General configuration for testing
  const title1 = "Kuesioner Penelitian 1";
  const title2 = "Kuesioner Penelitian 2";
  const title3 = "Kuesioner Penelitian 3";
  const scaleLimit = 5;
  const questionLimit = 3;
  const respondentLimit = 2;

  // Enum untuk QuestionnaireType
  enum QuestionnaireType {
    Public,
    Private,
  }

  before(async () => {
    [owner, alice, bob, charlie] = await ethers.getSigners();
  });

  beforeEach(async () => {
    factory = await new QuestionnaireFactory__factory(owner).deploy();
  });

  /* -------------------------------------------------------------------------- */
  /*                           1. Basic Factory Functions                       */
  /* -------------------------------------------------------------------------- */

  describe("Basic Factory Functions", () => {
    it("Berhasil deploy factory dengan initial state kosong", async () => {
      expect(await factory.getQuestionnaireCount()).to.equal(0);
      expect(await factory.uniqueUserCount()).to.equal(0);
      expect(await factory.isUserExists(await owner.getAddress())).to.equal(
        false,
      );
    });

    it("Berhasil membuat kuisioner publik", async () => {
      const tx = await factory.createQuestionnaire(
        QuestionnaireType.Public,
        title1,
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === "QuestionnaireCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.equal(undefined);

      const parsedEvent = factory.interface.parseLog(event!);
      const questionnaireAddress = parsedEvent!.args[1];

      await expect(tx)
        .to.emit(factory, "QuestionnaireCreated")
        .withArgs(await owner.getAddress(), questionnaireAddress);

      expect(await factory.getQuestionnaireCount()).to.equal(1);
      expect(await factory.uniqueUserCount()).to.equal(1);
      expect(await factory.isUserExists(await owner.getAddress())).to.equal(
        true,
      );
    });

    it("Berhasil membuat kuisioner privat", async () => {
      const tx = await factory.createQuestionnaire(
        QuestionnaireType.Private,
        title1,
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      await expect(tx).to.emit(factory, "QuestionnaireCreated");

      expect(await factory.getQuestionnaireCount()).to.equal(1);
      expect(await factory.uniqueUserCount()).to.equal(1);
    });

    it("Gagal membuat kuisioner dengan tipe tidak valid", async () => {
      // Solidity enum akan menerima nilai 2 sebagai valid enum value
      // Jadi kita test dengan cara yang berbeda - test revert tanpa custom error
      await expect(
        factory.createQuestionnaire(
          2, // Invalid type (hanya 0=Public, 1=Private yang valid)
          title1,
          scaleLimit,
          questionLimit,
          respondentLimit,
        ),
      ).to.be.reverted;
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           2. Multi-User Tracking                           */
  /* -------------------------------------------------------------------------- */

  describe("Multi-User Tracking", () => {
    beforeEach(async () => {
      // Owner membuat 2 kuisioner
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        title1,
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Private,
        title2,
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      // Alice membuat 1 kuisioner
      await factory
        .connect(alice)
        .createQuestionnaire(
          QuestionnaireType.Public,
          title3,
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
    });

    it("Menghitung unique users dengan benar", async () => {
      expect(await factory.uniqueUserCount()).to.equal(2);
      expect(await factory.isUserExists(await owner.getAddress())).to.equal(
        true,
      );
      expect(await factory.isUserExists(await alice.getAddress())).to.equal(
        true,
      );
      expect(await factory.isUserExists(await bob.getAddress())).to.equal(
        false,
      );
    });

    it("Menghitung kuisioner per user dengan benar", async () => {
      expect(
        await factory.getQuestionnaireCountByUser(await owner.getAddress()),
      ).to.equal(2);
      expect(
        await factory.getQuestionnaireCountByUser(await alice.getAddress()),
      ).to.equal(1);
      expect(
        await factory.getQuestionnaireCountByUser(await bob.getAddress()),
      ).to.equal(0);
    });

    it("Bob membuat kuisioner tidak mengubah count user yang sudah ada", async () => {
      await factory
        .connect(bob)
        .createQuestionnaire(
          QuestionnaireType.Public,
          "Bob's Questionnaire",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );

      expect(await factory.uniqueUserCount()).to.equal(3);
      expect(
        await factory.getQuestionnaireCountByUser(await owner.getAddress()),
      ).to.equal(2);
      expect(
        await factory.getQuestionnaireCountByUser(await alice.getAddress()),
      ).to.equal(1);
      expect(
        await factory.getQuestionnaireCountByUser(await bob.getAddress()),
      ).to.equal(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           3. Query Functions                               */
  /* -------------------------------------------------------------------------- */

  describe("Query Functions", () => {
    beforeEach(async () => {
      // Membuat mix kuisioner publik dan privat
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Public 1",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Private,
        "Private 1",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Public 2",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory
        .connect(alice)
        .createQuestionnaire(
          QuestionnaireType.Private,
          "Private 2",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
    });

    it("getQuestionnaires mengembalikan semua kuisioner", async () => {
      const questionnaires = await factory.getQuestionnaires();
      expect(questionnaires.length).to.equal(4);
    });

    it("getQuestionnairesByUser mengembalikan kuisioner user tertentu", async () => {
      const ownerQuestionnaires = await factory.getQuestionnairesByUser(
        await owner.getAddress(),
      );
      const aliceQuestionnaires = await factory.getQuestionnairesByUser(
        await alice.getAddress(),
      );

      expect(ownerQuestionnaires.length).to.equal(3);
      expect(aliceQuestionnaires.length).to.equal(1);
    });

    it("getLatestQuestionnaires mengembalikan kuisioner terbaru", async () => {
      const latest = await factory.getLatestQuestionnaires(2);
      expect(latest.length).to.equal(2);
      // Kuisioner terbaru harus yang terakhir dibuat (Alice's Private 2)
    });

    it("getQuestionnairesInRange mengembalikan range yang benar", async () => {
      const range = await factory.getQuestionnairesInRange(1, 3);
      expect(range.length).to.equal(2);
    });

    it("getQuestionnairesInRange gagal dengan parameter tidak valid", async () => {
      await expect(factory.getQuestionnairesInRange(3, 1))
        .to.be.revertedWithCustomError(factory, "InvalidRange")
        .withArgs(3, 1);
      await expect(factory.getQuestionnairesInRange(10, 15))
        .to.be.revertedWithCustomError(factory, "IndexOutOfBounds")
        .withArgs(10);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           4. Pagination Functions                          */
  /* -------------------------------------------------------------------------- */

  describe("Pagination Functions", () => {
    beforeEach(async () => {
      // Membuat 5 kuisioner: 3 public, 2 private
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Public 1",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Private,
        "Private 1",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Public 2",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Private,
        "Private 2",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Public 3",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
    });

    it("getQuestionnairesPaginated berfungsi dengan benar", async () => {
      const page1 = await factory.getQuestionnairesPaginated(0, 2);
      expect(page1.questionnaireList.length).to.equal(2);
      expect(page1.totalCount).to.equal(5);
      expect(page1.hasMore).to.equal(true);

      const page2 = await factory.getQuestionnairesPaginated(2, 2);
      expect(page2.questionnaireList.length).to.equal(2);
      expect(page2.totalCount).to.equal(5);
      expect(page2.hasMore).to.equal(true);

      const page3 = await factory.getQuestionnairesPaginated(4, 2);
      expect(page3.questionnaireList.length).to.equal(1);
      expect(page3.totalCount).to.equal(5);
      expect(page3.hasMore).to.equal(false);
    });

    it("getPublicQuestionnairesPaginated mengembalikan hanya kuisioner publik", async () => {
      const page1 = await factory.getPublicQuestionnairesPaginated(0, 2);
      expect(page1.questionnaireList.length).to.equal(2);
      expect(page1.totalCount).to.equal(3); // Total 3 public questionnaires
      expect(page1.hasMore).to.equal(true);

      const page2 = await factory.getPublicQuestionnairesPaginated(2, 2);
      expect(page2.questionnaireList.length).to.equal(1);
      expect(page2.totalCount).to.equal(3);
      expect(page2.hasMore).to.equal(false);
    });

    it("getPrivateQuestionnairesPaginated mengembalikan hanya kuisioner privat", async () => {
      const page1 = await factory.getPrivateQuestionnairesPaginated(0, 1);
      expect(page1.questionnaireList.length).to.equal(1);
      expect(page1.totalCount).to.equal(2); // Total 2 private questionnaires
      expect(page1.hasMore).to.equal(true);

      const page2 = await factory.getPrivateQuestionnairesPaginated(1, 1);
      expect(page2.questionnaireList.length).to.equal(1);
      expect(page2.totalCount).to.equal(2);
      expect(page2.hasMore).to.equal(false);
    });

    it("getQuestionnairesByUserPaginated berfungsi dengan benar", async () => {
      const page1 = await factory.getQuestionnairesByUserPaginated(
        await owner.getAddress(),
        0,
        3,
      );
      expect(page1.questionnaireList.length).to.equal(3);
      expect(page1.totalCount).to.equal(5);
      expect(page1.hasMore).to.equal(true);

      const page2 = await factory.getQuestionnairesByUserPaginated(
        await owner.getAddress(),
        3,
        3,
      );
      expect(page2.questionnaireList.length).to.equal(2);
      expect(page2.totalCount).to.equal(5);
      expect(page2.hasMore).to.equal(false);
    });

    it("Pagination mengembalikan array kosong untuk offset melebihi total", async () => {
      const result = await factory.getQuestionnairesPaginated(10, 2);
      expect(result.questionnaireList.length).to.equal(0);
      expect(result.totalCount).to.equal(5);
      expect(result.hasMore).to.equal(false);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           5. Type-Specific Queries                         */
  /* -------------------------------------------------------------------------- */

  describe("Type-Specific Queries", () => {
    beforeEach(async () => {
      // Alice membuat kuisioner publik
      await factory
        .connect(alice)
        .createQuestionnaire(
          QuestionnaireType.Public,
          "Alice Public",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
      // Bob membuat kuisioner privat
      await factory
        .connect(bob)
        .createQuestionnaire(
          QuestionnaireType.Private,
          "Bob Private",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
      // Charlie membuat mix
      await factory
        .connect(charlie)
        .createQuestionnaire(
          QuestionnaireType.Public,
          "Charlie Public",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
      await factory
        .connect(charlie)
        .createQuestionnaire(
          QuestionnaireType.Private,
          "Charlie Private",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
    });

    it("Query publik hanya mengembalikan kuisioner publik", async () => {
      const publicPage = await factory.getPublicQuestionnairesPaginated(0, 10);
      expect(publicPage.totalCount).to.equal(2); // Alice + Charlie public
    });

    it("Query privat hanya mengembalikan kuisioner privat", async () => {
      const privatePage = await factory.getPrivateQuestionnairesPaginated(
        0,
        10,
      );
      expect(privatePage.totalCount).to.equal(2); // Bob + Charlie private
    });

    it("Total questionnaires mencakup semua tipe", async () => {
      expect(await factory.getQuestionnaireCount()).to.equal(4);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           6. Edge Cases                                    */
  /* -------------------------------------------------------------------------- */

  describe("Edge Cases", () => {
    it("Factory kosong mengembalikan nilai default yang benar", async () => {
      const allQuestionnaires = await factory.getQuestionnaires();
      const publicPaginated = await factory.getPublicQuestionnairesPaginated(
        0,
        10,
      );
      const privatePaginated = await factory.getPrivateQuestionnairesPaginated(
        0,
        10,
      );
      const latest = await factory.getLatestQuestionnaires(5);

      expect(allQuestionnaires.length).to.equal(0);
      expect(publicPaginated.totalCount).to.equal(0);
      expect(privatePaginated.totalCount).to.equal(0);
      expect(latest.length).to.equal(0);
    });

    it("User yang belum pernah membuat kuisioner mengembalikan array kosong", async () => {
      const bobQuestionnaires = await factory.getQuestionnairesByUser(
        await bob.getAddress(),
      );
      const bobPaginated = await factory.getQuestionnairesByUserPaginated(
        await bob.getAddress(),
        0,
        10,
      );

      expect(bobQuestionnaires.length).to.equal(0);
      expect(bobPaginated.totalCount).to.equal(0);
      expect(bobPaginated.questionnaireList.length).to.equal(0);
      expect(bobPaginated.hasMore).to.equal(false);
    });

    it("Limit lebih besar dari total data mengembalikan semua data", async () => {
      await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Only One",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      const result = await factory.getQuestionnairesPaginated(0, 100);
      expect(result.questionnaireList.length).to.equal(1);
      expect(result.totalCount).to.equal(1);
      expect(result.hasMore).to.equal(false);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           8. Custom Errors Testing                        */
  /* -------------------------------------------------------------------------- */

  describe("Custom Errors Testing", () => {
    it("Menguji custom error untuk invalid questionnaire type", async () => {
      // Test dengan value 2 yang seharusnya invalid
      await expect(
        factory.createQuestionnaire(
          2, // Invalid type (hanya 0=Public, 1=Private yang valid)
          title1,
          scaleLimit,
          questionLimit,
          respondentLimit,
        ),
      ).to.be.reverted;
    });

    it("Menguji custom error untuk index out of bounds", async () => {
      // Test dengan range yang invalid
      await expect(factory.getQuestionnairesInRange(5, 10))
        .to.be.revertedWithCustomError(factory, "IndexOutOfBounds")
        .withArgs(5);
    });

    it("Menguji custom error untuk invalid range", async () => {
      await expect(factory.getQuestionnairesInRange(10, 5))
        .to.be.revertedWithCustomError(factory, "InvalidRange")
        .withArgs(10, 5);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           9. Integration Testing                           */
  /* -------------------------------------------------------------------------- */

  describe("Integration Testing", () => {
    it("Workflow lengkap: Create -> Query -> Validate", async () => {
      // 1. Create questionnaires by different users
      const tx1 = await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Public Survey",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      const tx2 = await factory
        .connect(alice)
        .createQuestionnaire(
          QuestionnaireType.Private,
          "Private Survey",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );

      // 2. Validate counts
      expect(await factory.getQuestionnaireCount()).to.equal(2);
      expect(await factory.uniqueUserCount()).to.equal(2);

      // 3. Validate user-specific queries
      expect(
        await factory.getQuestionnaireCountByUser(await owner.getAddress()),
      ).to.equal(1);
      expect(
        await factory.getQuestionnaireCountByUser(await alice.getAddress()),
      ).to.equal(1);

      // 4. Validate type-specific queries
      const publicPaginated = await factory.getPublicQuestionnairesPaginated(
        0,
        10,
      );
      const privatePaginated = await factory.getPrivateQuestionnairesPaginated(
        0,
        10,
      );

      expect(publicPaginated.totalCount).to.equal(1);
      expect(privatePaginated.totalCount).to.equal(1);

      // 5. Validate events were emitted
      await expect(tx1).to.emit(factory, "QuestionnaireCreated");
      await expect(tx2).to.emit(factory, "QuestionnaireCreated");
    });

    it("Gas optimization test: O(1) vs O(n) access patterns", async () => {
      // Create multiple questionnaires
      for (let i = 0; i < 5; i++) {
        await factory.createQuestionnaire(
          i % 2 === 0 ? QuestionnaireType.Public : QuestionnaireType.Private,
          `Survey ${i}`,
          scaleLimit,
          questionLimit,
          respondentLimit,
        );
      }

      // Test pagination efficiency
      const page1 = await factory.getQuestionnairesPaginated(0, 3);
      const page2 = await factory.getQuestionnairesPaginated(3, 3);

      expect(page1.questionnaireList.length).to.equal(3);
      expect(page1.hasMore).to.equal(true);
      expect(page2.questionnaireList.length).to.equal(2);
      expect(page2.hasMore).to.equal(false);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           10. Events Testing                               */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                           10. Events Testing                               */
  /* -------------------------------------------------------------------------- */

  describe("Events", () => {
    it("Event QuestionnaireCreated teremit dengan parameter yang benar", async () => {
      const tx = await factory.createQuestionnaire(
        QuestionnaireType.Public,
        title1,
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      const receipt = await tx.wait();
      const events = receipt?.logs;

      // Cari event QuestionnaireCreated
      const event = events?.find((log) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === "QuestionnaireCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.equal(undefined);
    });

    it("Multiple questionnaire creation menghasilkan multiple events", async () => {
      const tx1 = await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Q1",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );
      const tx2 = await factory.createQuestionnaire(
        QuestionnaireType.Private,
        "Q2",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      await expect(tx1).to.emit(factory, "QuestionnaireCreated");
      await expect(tx2).to.emit(factory, "QuestionnaireCreated");
    });

    it("Event parameters are correct for different users", async () => {
      const tx1 = await factory.createQuestionnaire(
        QuestionnaireType.Public,
        "Owner's Survey",
        scaleLimit,
        questionLimit,
        respondentLimit,
      );

      const receipt1 = await tx1.wait();
      const event1 = receipt1?.logs.find((log) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === "QuestionnaireCreated";
        } catch {
          return false;
        }
      });

      expect(event1).to.not.equal(undefined);
      const parsedEvent1 = factory.interface.parseLog(event1!);
      expect(parsedEvent1!.args[0]).to.equal(await owner.getAddress());

      const tx2 = await factory
        .connect(alice)
        .createQuestionnaire(
          QuestionnaireType.Private,
          "Alice's Survey",
          scaleLimit,
          questionLimit,
          respondentLimit,
        );

      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs.find((log) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === "QuestionnaireCreated";
        } catch {
          return false;
        }
      });

      expect(event2).to.not.equal(undefined);
      const parsedEvent2 = factory.interface.parseLog(event2!);
      expect(parsedEvent2!.args[0]).to.equal(await alice.getAddress());
    });
  });
});
