const hre = require("hardhat");
const fs = require("fs");
const ethers = hre.ethers;
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CREDENTIALS_CONTRACT_ADDRESS;
  const studentAddress = "0xc3b1109Cb52c951Ee02a77D58BA797B4419E5694";
  const credentialPath = "./tanka_credential.json";

  // Load and stringify the credential file
  const file = fs.readFileSync(credentialPath);
  const jsonString = JSON.stringify(JSON.parse(file));
  const localHash = ethers.keccak256(ethers.toUtf8Bytes(jsonString));

  console.log("📄 Local Document Hash:", localHash);

  // Get contract + on-chain hash
  const contract = await hre.ethers.getContractAt("UBaEducationCredentialsStore", contractAddress);
  const [onChainHash, verified] = await contract.getCredential(studentAddress);

  console.log("🔗 On-Chain Document Hash:", onChainHash);
  console.log("✅ Verified Status:", verified);

  if (onChainHash === localHash) {
    console.log("✅ Document integrity confirmed!");
  } else {
    console.warn("⚠️ Document mismatch! Possible tampering or different formatting.");
  }
}

main().catch((err) => {
  console.error("🚨 Script failed:", err.message || err);
  process.exit(1);
});
