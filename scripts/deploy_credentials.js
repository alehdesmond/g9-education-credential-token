// scripts/deploy_credentials.js
const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\uD83D\uDC64 Deployer:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("\uD83D\uDCB0 Balance:", hre.ethers.formatEther(balance), "ETH");

  const g9TokenAddress = process.env.G9TOKEN_ADDRESS;
  if (!g9TokenAddress) {
    throw new Error("Missing G9TOKEN_ADDRESS in .env");
  }

  console.log("\uD83D\uDE80 Deploying contract with G9Token address:", g9TokenAddress);

  const Credentials = await hre.ethers.getContractFactory("UBaEducationCredentialsStore");
  const contract = await Credentials.deploy(g9TokenAddress);

  console.log("\u23F3 Waiting for confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\u2705 Contract deployed at:", address);
  console.log("\uD83D\uDD17 View on Etherscan:", `https://sepolia.etherscan.io/address/${address}`);

  updateEnv("CREDENTIALS_CONTRACT_ADDRESS", address);
  console.log("\uD83D\uDD04 Updated .env with CREDENTIALS_CONTRACT_ADDRESS");
}

function updateEnv(key, value) {
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
}

main().catch((err) => {
  console.error("\uD83D\uDEA8 Deployment error:", err.message);
  process.exit(1);
});
