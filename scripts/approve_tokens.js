// scripts/approve_tokens.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const g9TokenAddress = process.env.G9TOKEN_ADDRESS;
  const credentialsContract = process.env.CREDENTIALS_CONTRACT_ADDRESS;

  const G9Token = await ethers.getContractAt("G9Token", g9TokenAddress);
  const amountToApprove = ethers.parseUnits("50", 18); // 50 tokens

  const tx = await G9Token.approve(credentialsContract, amountToApprove);
  console.log("\u23F3 Waiting for approval confirmation...");
  await tx.wait();

  console.log(`\u2705 Approved ${amountToApprove} G9TK tokens for ${credentialsContract}`);
  console.log("\uD83D\uDD17 Tx Hash:", tx.hash);
}

main().catch(console.error);
