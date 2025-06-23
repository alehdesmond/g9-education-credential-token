const hre = require("hardhat");
require("dotenv").config();
const { ethers } = hre;

async function main() {
  const admin = process.env.WALLET_ADDRESS;
  const contractAddress = process.env.CREDENTIALS_CONTRACT_ADDRESS;

  console.log("👤 Using admin address:", admin);
  console.log("🏢 Contract address:", contractAddress);

  const UBaEducationCredentialsStore = await hre.ethers.getContractAt(
    "UBaEducationCredentialsStore",
    contractAddress
  );

  // 👤 Student data
  const studentAddress = "0xc3b1109Cb52c951Ee02a77D58BA797B4419E5694";
  const studentName = "Tanka";
  const program = "Professional Cybersecurity";
  const degree = "Bachelor";
  const graduationYear = 2026;

  // ✅ Create credential object and hash it
  const credentialObject = {
    name: studentName,
    program,
    degree,
    graduationYear
  };

  const documentHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(credentialObject))
  );

  console.log("📝 Storing hashed credential for:", studentName);
  console.log("🔐 Document Hash:", documentHash);

  const tx = await UBaEducationCredentialsStore.addCredential(
    studentAddress,
    documentHash
  );

  console.log("⏳ Waiting for confirmation...");
  await tx.wait();

  console.log(`✅ Credential hash stored for ${studentName} at address ${studentAddress}`);
  console.log(`🔗 Tx Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error("🚨 Error storing credentials:", error.message || error);
  process.exit(1);
});
