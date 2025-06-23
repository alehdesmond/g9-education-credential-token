const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("G9Token", function () {
  let G9Token, g9Token, owner, addr1, addr2;
  const initialSupply = ethers.parseUnits("10000", 18);

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const signers = [owner.address, addr1.address, addr2.address];

    const G9TokenFactory = await ethers.getContractFactory("G9Token");
    g9Token = await G9TokenFactory.deploy(signers);
    await g9Token.waitForDeployment();
  });

  it("should have correct name and symbol", async () => {
    expect(await g9Token.name()).to.equal("Group9 Token");
    expect(await g9Token.symbol()).to.equal("G9TK");
  });

  it("should mint initial supply to deployer", async () => {
    const deployerBalance = await g9Token.balanceOf(owner.address);
    expect(deployerBalance).to.equal(initialSupply);
  });

  it("should allow transfer of tokens", async () => {
    const amount = ethers.parseUnits("100", 18);
    await g9Token.transfer(addr1.address, amount);
    expect(await g9Token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should allow token purchase with ETH", async () => {
    const amount = ethers.parseEther("1"); // 1 ETH = 1000 tokens
    await addr1.sendTransaction({
      to: await g9Token.getAddress(),
      value: amount,
    });

    const tokens = await g9Token.balanceOf(addr1.address);
    expect(tokens).to.equal(ethers.parseUnits("1000", 18));
  });
});
