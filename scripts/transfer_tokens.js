require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const recipient = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  const tokenAddress = process.env.G9TOKEN_ADDRESS;
  const [deployer] = await hre.ethers.getSigners();

  const G9Token = await hre.ethers.getContractAt("G9Token", tokenAddress);
  const tx = await G9Token.transfer(recipient, hre.ethers.parseUnits("10", 18));

  console.log("⏳ Waiting for confirmation...");
  await tx.wait();

  console.log("✅ 10 G9TK tokens transferred to:", recipient);
  console.log("🔗 Tx Hash:", tx.hash);
}
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
