const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CREDENTIALS_CONTRACT_ADDRESS;
  const studentAddress = "0x7A99BD26a70dD3F521b49028dEEa342A5CaDf874";

  console.log("📄 Fetching credential hash for:", studentAddress);

  const UBaEducationCredentialsStore = await hre.ethers.getContractAt(
    "UBaEducationCredentialsStore",
    contractAddress
  );

  const [documentHash, isVerified] = await UBaEducationCredentialsStore.getCredential(studentAddress);

  console.log("📘 Credential Info:");
  console.log("   🔐 Document Hash:", documentHash);
  console.log("   ✅ Verified:", isVerified);
}

main().catch((error) => {
  console.error("🚨 Error fetching credentials:", error.message || error);
  process.exit(1);
});
