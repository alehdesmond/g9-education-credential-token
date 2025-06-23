const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UBaEducationCredentialsStore", function () {
  let G9Token, token, Credentials, credentials;
  let admin, student, signer2, signer3;

  beforeEach(async () => {
    [admin, student, signer2, signer3] = await ethers.getSigners();

    // Deploy G9Token
    G9Token = await ethers.getContractFactory("G9Token");
    token = await G9Token.deploy([admin.address, signer2.address, signer3.address]);
    await token.waitForDeployment();

    // Transfer tokens to student
    await token.transfer(student.address, ethers.parseUnits("10", 18));

    // Deploy credentials store
    Credentials = await ethers.getContractFactory("UBaEducationCredentialsStore");
    credentials = await Credentials.deploy(await token.getAddress());
    await credentials.waitForDeployment();
  });

  it("should deploy with correct admin", async function () {
    expect(await credentials.admin()).to.equal(admin.address);
  });

  it("should allow admin to add a hashed credential", async function () {
    const docHash = ethers.keccak256(
      ethers.toUtf8Bytes("John Doe|CS|BSc|2023")
    );

    await credentials.addCredential(student.address, docHash);

    const [storedHash, verified] = await credentials.getCredential(student.address);
    expect(storedHash).to.equal(docHash);
    expect(verified).to.equal(false);
  });

  it("should allow admin to verify credential with enough tokens", async function () {
    const docHash = ethers.keccak256(
      ethers.toUtf8Bytes("Jane Doe|Cyber|BSc|2024")
    );
    await credentials.addCredential(student.address, docHash);
    await credentials.verifyCredential(student.address);

    const [storedHash, verified] = await credentials.getCredential(student.address);
    expect(verified).to.equal(true);
  });

  it("should fail to verify if student lacks tokens", async function () {
    const docHash = ethers.keccak256(
      ethers.toUtf8Bytes("Not Enough|Cyber|BSc|2025")
    );
    const lowBalance = signer2;

    await credentials.addCredential(lowBalance.address, docHash);

    await expect(
      credentials.verifyCredential(lowBalance.address)
    ).to.be.revertedWith("Student does not hold enough G9 tokens");
  });

  it("should not allow non-admin to add credentials", async function () {
    const docHash = ethers.keccak256(
      ethers.toUtf8Bytes("Malicious|Hacker|BSc|2022")
    );

    await expect(
      credentials.connect(student).addCredential(student.address, docHash)
    ).to.be.revertedWith("Only admin can perform this action");
  });
});
