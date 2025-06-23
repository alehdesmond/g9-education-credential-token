const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const admin = process.env.WALLET_ADDRESS;
  const contractAddress = process.env.CREDENTIALS_CONTRACT_ADDRESS;

  const studentAddress = "0xc3b1109Cb52c951Ee02a77D58BA797B4419E5694"; // Tanka's wallet address

  console.log("👤 Admin address:", admin);
  console.log("📘 Verifying credentials for student:", studentAddress);

  const contract = await hre.ethers.getContractAt("UBaEducationCredentialsStore", contractAddress);

  const tx = await contract.verifyCredential(studentAddress);

  console.log("⏳ Waiting for confirmation...");
  await tx.wait();

  console.log(`✅ Credential verified for ${studentAddress}`);
  console.log(`🔗 Tx Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error("🚨 Error verifying credentials:", error.message || error);
  process.exit(1);
});
