const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("G9Token - Reentrancy Security Test", function () {
    let g9Token, attackerContract;
    let owner, signer1, signer2;

    beforeEach(async function () {
        [owner, signer1, signer2] = await ethers.getSigners();

        const G9Token = await ethers.getContractFactory("G9Token");
        g9Token = await G9Token.deploy(signer1.address, signer2.address, owner.address);

        const Attacker = await ethers.getContractFactory("Attacker");
        attackerContract = await Attacker.deploy(await g9Token.getAddress());

        await owner.sendTransaction({
            to: await g9Token.getAddress(),
            value: ethers.parseEther("10")
        });
    });

    it("Should block reentrancy during executeWithdrawal and revert", async function () {
        const withdrawAmount = ethers.parseEther("1");

        await g9Token.connect(signer1).proposeWithdraw(withdrawAmount, await attackerContract.getAddress());
        await g9Token.connect(signer1).approveWithdraw(0);
        await g9Token.connect(signer2).approveWithdraw(0);

        // FIX: The test should expect the 'ETH transfer failed' message, which is the
        // final result of the ReentrancyGuard successfully stopping the attack.
        await expect(
            attackerContract.beginAttack()
        ).to.be.revertedWith("ETH transfer failed");
    });
});