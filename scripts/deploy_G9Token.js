const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting deployment process...");

  // ✅ Load and validate signer addresses
  const signers = [
    process.env.SIGNER1?.trim(),
    process.env.SIGNER2?.trim(),
    process.env.SIGNER3?.trim()
  ];

  if (signers.some(s => !s || !s.startsWith("0x") || s.length !== 42)) {
    throw new Error("❌ One or more SIGNER addresses in .env are missing or invalid.");
  }

  // ✅ Normalize and checksum addresses
  const formattedSigners = signers.map(addr => hre.ethers.getAddress(addr));

  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", Number(hre.ethers.formatEther(balance)).toFixed(4), "ETH");

  console.log("🔏 Signers configured:");
  formattedSigners.forEach((s, i) => console.log(`   Signer ${i + 1}: ${s}`));

  try {
    console.log("🛠️  Creating contract factory...");
    const G9Token = await hre.ethers.getContractFactory("G9Token");

    console.log("📦 Passing these signers to the contract constructor:", formattedSigners);

    console.log("🚀 Deploying contract...");
    const g9Token = await G9Token.deploy(formattedSigners, {
      gasPrice: hre.ethers.parseUnits("2", "gwei"),
      gasLimit: 4000000
    });

    console.log("⏳ Waiting for deployment confirmation...");
    await g9Token.waitForDeployment();

    const tokenAddress = await g9Token.getAddress();
    console.log("✅ G9Token deployed to:", tokenAddress);
    console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + tokenAddress);

    updateEnvFile("G9TOKEN_ADDRESS", tokenAddress);
    console.log("🔄 .env updated with G9TOKEN_ADDRESS.");
    console.log("🎉 Deployment successful!");
  } catch (err) {
    console.error("🚨 Deployment failed:");
    console.error(err);
  }
}

function updateEnvFile(key, value) {
  const path = ".env";
  let env = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(env)) {
    env = env.replace(regex, line);
  } else {
    env += `\n${line}`;
  }

  fs.writeFileSync(path, env);
  console.log(`🔄 Updated .env with ${key}`);
}

main().catch(err => {
  console.error("❌ Script execution error:", err.message);
  process.exit(1);
});
