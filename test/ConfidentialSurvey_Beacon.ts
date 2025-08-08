import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialSurvey_Beacon } from "../types/ConfidentialSurvey_Beacon";

describe("ConfidentialSurvey_Beacon", function () {
  let beacon: ConfidentialSurvey_Beacon;
  let implementationAddress: string;
  let newImplementationAddress: string;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user, stranger] = await ethers.getSigners();

    // Deploy implementation contracts
    const ConfidentialSurveyFactory =
      await ethers.getContractFactory("ConfidentialSurvey");
    const implementation = await ConfidentialSurveyFactory.deploy();
    await implementation.waitForDeployment();
    implementationAddress = await implementation.getAddress();

    const newImplementation = await ConfidentialSurveyFactory.deploy();
    await newImplementation.waitForDeployment();
    newImplementationAddress = await newImplementation.getAddress();

    // Deploy beacon
    const BeaconFactory = await ethers.getContractFactory(
      "ConfidentialSurvey_Beacon",
    );
    const beaconContract = await BeaconFactory.deploy(
      implementationAddress,
      owner.address,
    );
    await beaconContract.waitForDeployment();
    beacon = beaconContract as unknown as ConfidentialSurvey_Beacon;
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial implementation", async function () {
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.equal(implementationAddress);
    });

    it("Should set the correct owner", async function () {
      const beaconOwner = await beacon.owner();
      expect(beaconOwner).to.equal(owner.address);
    });

    it("Should revert if implementation address is zero", async function () {
      const BeaconFactory = await ethers.getContractFactory(
        "ConfidentialSurvey_Beacon",
      );

      await expect(
        BeaconFactory.deploy(ethers.ZeroAddress, owner.address),
      ).to.be.revertedWithCustomError(
        BeaconFactory,
        "BeaconInvalidImplementation",
      );
    });

    it("Should return implementation address via getImplementation", async function () {
      const currentImpl = await beacon.getImplementation();
      expect(currentImpl).to.equal(implementationAddress);
    });
  });

  describe("Implementation Upgrade", function () {
    it("Should allow owner to upgrade implementation", async function () {
      const oldImplementation = await beacon.implementation();

      await expect(beacon.upgradeImplementation(newImplementationAddress))
        .to.emit(beacon, "ImplementationUpgraded")
        .withArgs(oldImplementation, newImplementationAddress);

      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.equal(newImplementationAddress);
    });

    it("Should revert if non-owner tries to upgrade", async function () {
      await expect(
        beacon
          .connect(stranger)
          .upgradeImplementation(newImplementationAddress),
      ).to.be.revertedWithCustomError(beacon, "OwnableUnauthorizedAccount");
    });

    it("Should emit Upgraded event from UpgradeableBeacon", async function () {
      await expect(beacon.upgradeImplementation(newImplementationAddress))
        .to.emit(beacon, "Upgraded")
        .withArgs(newImplementationAddress);
    });

    it("Should update implementation returned by getImplementation", async function () {
      await beacon.upgradeImplementation(newImplementationAddress);

      const currentImpl = await beacon.getImplementation();
      expect(currentImpl).to.equal(newImplementationAddress);
    });

    it("Should handle multiple upgrades correctly", async function () {
      // First upgrade
      await beacon.upgradeImplementation(newImplementationAddress);
      expect(await beacon.implementation()).to.equal(newImplementationAddress);

      // Deploy another implementation
      const ConfidentialSurveyFactory =
        await ethers.getContractFactory("ConfidentialSurvey");
      const thirdImplementation = await ConfidentialSurveyFactory.deploy();
      await thirdImplementation.waitForDeployment();
      const thirdImplementationAddress = await thirdImplementation.getAddress();

      // Second upgrade
      await beacon.upgradeImplementation(thirdImplementationAddress);
      expect(await beacon.implementation()).to.equal(
        thirdImplementationAddress,
      );
    });
  });

  describe("Ownership Management", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(beacon.transferOwnership(user.address))
        .to.emit(beacon, "OwnershipTransferred")
        .withArgs(owner.address, user.address);

      expect(await beacon.owner()).to.equal(user.address);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      await expect(
        beacon.connect(stranger).transferOwnership(user.address),
      ).to.be.revertedWithCustomError(beacon, "OwnableUnauthorizedAccount");
    });

    it("Should allow new owner to upgrade implementation", async function () {
      // Transfer ownership
      await beacon.transferOwnership(user.address);

      // New owner should be able to upgrade
      await expect(
        beacon.connect(user).upgradeImplementation(newImplementationAddress),
      ).to.not.be.reverted;

      // Old owner should not be able to upgrade
      await expect(
        beacon.upgradeImplementation(implementationAddress),
      ).to.be.revertedWithCustomError(beacon, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle upgrading to same implementation", async function () {
      const currentImpl = await beacon.implementation();

      await expect(beacon.upgradeImplementation(currentImpl)).to.not.be
        .reverted;

      expect(await beacon.implementation()).to.equal(currentImpl);
    });

    it("Should maintain state consistency after multiple operations", async function () {
      // Upgrade implementation
      await beacon.upgradeImplementation(newImplementationAddress);

      // Transfer ownership
      await beacon.transferOwnership(user.address);

      // Check final state
      expect(await beacon.implementation()).to.equal(newImplementationAddress);
      expect(await beacon.owner()).to.equal(user.address);
      expect(await beacon.getImplementation()).to.equal(
        newImplementationAddress,
      );
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas costs for upgrade", async function () {
      const tx = await beacon.upgradeImplementation(newImplementationAddress);
      const receipt = await tx.wait();

      // Gas should be reasonable (less than 100k gas)
      expect(receipt!.gasUsed).to.be.lt(100000);
    });

    it("Should have minimal gas costs for getImplementation", async function () {
      const result = await beacon.getImplementation.staticCall();
      // This is a view function, so it should not consume gas when called statically
      expect(result).to.equal(implementationAddress);
    });
  });
});
