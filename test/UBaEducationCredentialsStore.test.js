const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UBaEducationCredentialsStore Contract Tests", function () {
    let g9Token;
    let ubaStore;
    let owner, userAccount;

    beforeEach(async function () {
        [owner, userAccount] = await ethers.getSigners();

        const G9Token = await ethers.getContractFactory("G9Token");
        g9Token = await G9Token.deploy(owner.address, userAccount.address, "0xdD2FD4581271e230360230F9337D5c0430Bf44C0");

        const UBaStore = await ethers.getContractFactory("UBaEducationCredentialsStore");
        ubaStore = await UBaStore.deploy(await g9Token.getAddress());
        
        await owner.sendTransaction({ to: await g9Token.getAddress(), value: ethers.parseEther("1") });
        const userInitialTokens = await g9Token.balanceOf(owner.address);
        await g9Token.transfer(userAccount.address, userInitialTokens);
    });

    describe("Credential Storage", function () {
        const documentHash = ethers.keccak256(ethers.toUtf8Bytes("test_hash"));

        it("Should allow a user to store a credential hash after approving tokens", async function () {
            const fee = await ubaStore.fee();
            const initialUserBalance = await g9Token.balanceOf(userAccount.address);
            
            await g9Token.connect(userAccount).approve(await ubaStore.getAddress(), fee);
            
            await expect(ubaStore.connect(userAccount).addCredential(documentHash))
                .to.emit(ubaStore, "CredentialStored")
                .withArgs(userAccount.address, documentHash);

            const finalUserBalance = await g9Token.balanceOf(userAccount.address);
            expect(finalUserBalance).to.equal(initialUserBalance - fee);
            expect(await g9Token.balanceOf(await ubaStore.getAddress())).to.equal(fee);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow the owner to withdraw collected tokens", async function () {
            const fee = await ubaStore.fee();
            await g9Token.connect(userAccount).approve(await ubaStore.getAddress(), fee);
            await ubaStore.connect(userAccount).addCredential("0x" + "a".repeat(64));
            
            const contractBalance = await g9Token.balanceOf(await ubaStore.getAddress());

            await expect(() => ubaStore.connect(owner).withdrawTokens())
                .to.changeTokenBalances(g9Token, [ubaStore, owner], [contractBalance * BigInt(-1), contractBalance]);
        });
    });
});