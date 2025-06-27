const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("G9Token Contract Tests", function () {
    let g9Token;
    let owner, signer1, signer2, signer3, userAccount, anotherAccount;
    const RATE = 1000;

    beforeEach(async function () {
        [owner, signer1, signer2, signer3, userAccount, anotherAccount] = await ethers.getSigners();
        const G9Token = await ethers.getContractFactory("G9Token");
        g9Token = await G9Token.deploy(signer1.address, signer2.address, signer3.address);
    });

    describe("Deployment", function () {
        it("Should set the right signers", async function () {
            expect(await g9Token.signer1()).to.equal(signer1.address);
            expect(await g9Token.signer2()).to.equal(signer2.address);
            expect(await g9Token.signer3()).to.equal(signer3.address);
        });
    });

    describe("Token Purchase", function () {
        // FIX: Added 'async' keyword
        it("Should allow users to buy tokens by sending ETH", async function () {
            const sendValue = ethers.parseEther("1");
            const expectedTokens = sendValue * BigInt(RATE);
            
            await expect(userAccount.sendTransaction({
                to: await g9Token.getAddress(),
                value: sendValue,
            })).to.eventually.be.fulfilled; // Using 'eventually' for sendTransaction checks
        });
    });

    describe("Multi-Signature Minting (3-of-3)", function () {
        const mintAmount = ethers.parseUnits("500", 18);

        // FIX: Added 'async' keyword
        it("Should successfully mint after 3 unique signers approve", async function () {
            await g9Token.connect(signer1).proposeMint(userAccount.address, mintAmount);
            await g9Token.connect(signer1).approveMint(0);
            await g9Token.connect(signer2).approveMint(0);
            await g9Token.connect(signer3).approveMint(0);
            await expect(() => g9Token.connect(owner).executeMint(0))
                .to.changeTokenBalance(g9Token, userAccount, mintAmount);
        });
    });

    describe("Multi-Signature Withdrawal (2-of-3)", function () {
        const depositAmount = ethers.parseEther("5");
        const withdrawAmount = ethers.parseEther("2");

        // FIX: Added 'async' keyword
        beforeEach(async function () {
            await owner.sendTransaction({
                to: await g9Token.getAddress(),
                value: depositAmount,
            });
        });

        // FIX: Added 'async' keyword
        it("Should successfully withdraw ETH after 2 unique signers approve", async function () {
            await g9Token.connect(signer1).proposeWithdraw(withdrawAmount, anotherAccount.address);
            await g9Token.connect(signer2).approveWithdraw(0);
            await g9Token.connect(signer3).approveWithdraw(0);
            await expect(() => g9Token.connect(owner).executeWithdraw(0))
                .to.changeEtherBalance(anotherAccount, withdrawAmount);
        });
    });
});