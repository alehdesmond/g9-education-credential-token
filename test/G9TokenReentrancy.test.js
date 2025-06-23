const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("G9Token - Reentrancy Test", function () {
  let G9Token, token, attackContract, owner, signer2, signer3;

  beforeEach(async () => {
    [owner, signer2, signer3] = await ethers.getSigners();

    const G9TokenFactory = await ethers.getContractFactory("G9Token");
    token = await G9TokenFactory.deploy([
      owner.address,
      signer2.address,
      signer3.address
    ]);
    await token.waitForDeployment();

    // Send ETH to token contract to allow withdrawal
    await owner.sendTransaction({
      to: await token.getAddress(),
      value: ethers.parseEther("5")
    });

    // Deploy attack contract
    const Attack = await ethers.getContractFactory("ReentrancyAttack");
    attackContract = await Attack.deploy(await token.getAddress());
    await attackContract.waitForDeployment();
  });

  it("Should block reentrancy during executeWithdrawal", async () => {
    const attackAddress = await attackContract.getAddress();

    // Admin proposes withdrawal to the attack contract
    await token.proposeWithdrawal(ethers.parseEther("1"), attackAddress);

    // Approvals (from different signers)
    await token.connect(signer2).approveWithdrawal();
    await token.connect(signer3).approveWithdrawal();

    // Expect reentrancy to fail
    await expect(
      attackContract.connect(owner).attack()
    ).to.be.revertedWith("Not authorized signer"); // or fallback logic
  });
});
