import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyContract", function () {
  let myContract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const MyContractFactory = await ethers.getContractFactory("MyContract");
    myContract = await MyContractFactory.deploy("Hello World");
    await myContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right message", async function () {
      expect(await myContract.getMessage()).to.equal("Hello World");
    });

    it("Should set the right owner", async function () {
      expect(await myContract.owner()).to.equal(owner.address);
    });
  });

  describe("setMessage", function () {
    it("Should change message when called by owner", async function () {
      await myContract.setMessage("New Message");
      expect(await myContract.getMessage()).to.equal("New Message");
    });

    it("Should revert when called by non-owner", async function () {
      await expect(
        myContract.connect(addr1).setMessage("New Message")
      ).to.be.revertedWith("Only owner can change message");
    });

    it("Should emit MessageChanged event", async function () {
      await expect(myContract.setMessage("New Message"))
        .to.emit(myContract, "MessageChanged")
        .withArgs("New Message");
    });
  });
});
