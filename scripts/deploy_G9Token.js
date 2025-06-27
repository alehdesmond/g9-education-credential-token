const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

function updateEnvFile(key, value) {
  const path = ".env";
  const fullLine = `${key}=${value}`;
  const envFileContent = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
  const lines = envFileContent.split('\n');
  const keyIndex = lines.findIndex(line => line.startsWith(`${key}=`));

  if (keyIndex >= 0) {
    lines[keyIndex] = fullLine;
  } else {
    lines.push(fullLine);
  }

  fs.writeFileSync(path, lines.join('\n'));
  console.log(`✅  Updated .env with: ${fullLine}`);
}

async function main() {
  try {
    console.log("🚀 Starting deployment script...");
    console.log("---------------------------------");

    const signers = [
      process.env.SIGNER1?.trim(),
      process.env.SIGNER2?.trim(),
      process.env.SIGNER3?.trim()
    ];

    if (signers.some(s => !s || !s.startsWith("0x") || s.length !== 42)) {
      throw new Error("❌ ERROR: One or more SIGNER addresses in the .env file are missing or invalid.");
    }
    
    const formattedSigners = signers.map(addr => hre.ethers.getAddress(addr));
    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    
    console.log("👤 Deployer Account:", deployer.address);
    console.log("💰 Account Balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("🔏 Using Multi-sig Signers from .env:");
    formattedSigners.forEach((s, i) => console.log(`   - Signer ${i + 1}: ${s}`));
    console.log("---------------------------------");

    // --- DEPLOY G9TOKEN CONTRACT ---
    console.log("\n1. Deploying G9Token...");
    const G9Token = await hre.ethers.getContractFactory("G9Token");
    
    // THE FIX: We explicitly spread the arguments.
    // This is the most stable way to pass constructor arguments in Ethers v6.
    const g9Token = await G9Token.deploy(formattedSigners[0], formattedSigners[1], formattedSigners[2]);
    await g9Token.waitForDeployment(); // Wait for the deployment to be confirmed

    const g9TokenAddress = await g9Token.getAddress();
    console.log(`✔️  G9Token deployed successfully to: ${g9TokenAddress}`);
    updateEnvFile("G9TOKEN_ADDRESS", g9TokenAddress);

    // --- DEPLOY UBaEducationCredentialsStore CONTRACT ---
    console.log("\n2. Deploying UBaEducationCredentialsStore...");
    const UBaStore = await hre.ethers.getContractFactory("UBaEducationCredentialsStore");
    const ubaStore = await UBaStore.deploy(g9TokenAddress);
    await ubaStore.waitForDeployment();
    
    const ubaStoreAddress = await ubaStore.getAddress();
    console.log(`✔️  UBaEducationCredentialsStore deployed successfully to: ${ubaStoreAddress}`);
    updateEnvFile("UBA_STORE_ADDRESS", ubaStoreAddress);
    
    console.log("\n---------------------------------");
    console.log("🎉 All contracts deployed and .env file updated successfully!");
    console.log("🔗 G9Token on Sepolia Etherscan: https://sepolia.etherscan.io/address/" + g9TokenAddress);
    console.log("🔗 UBaStore on Sepolia Etherscan: https://sepolia.etherscan.io/address/" + ubaStoreAddress);

  } catch (error) {
    console.error("\n🚨 Deployment script failed!");
    console.error(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ An unhandled error occurred:", error);
  process.exit(1);
});