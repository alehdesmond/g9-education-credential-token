// scripts/test_token_verification.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CREDENTIALS_CONTRACT_ADDRESS;
  const testStudent = "0x0874207411f712D90edd8ded353fdc6f9a417903"; // Student without 10 G9TK

  console.log("📘 Testing token balance restriction for:", testStudent);

  const credentialsContract = await hre.ethers.getContractAt(
    "UBaEducationCredentialsStore",
    contractAddress
  );

  try {
    const tx = await credentialsContract.verifyCredential(testStudent);
    await tx.wait();
    console.log("❌ ERROR: Credential was verified despite insufficient tokens!");
  } catch (err) {
    console.log("✅ Expected failure:", err.message || err);
  }
}

main().catch((error) => {
  console.error("🚨 Script error:", error);
  process.exit(1);
});
