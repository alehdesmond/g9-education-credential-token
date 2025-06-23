// scripts/alchemyDemo.js
require('dotenv').config();
const { Network, Alchemy } = require("alchemy-sdk");

// Get API key from environment variables
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY || "9IMKX800JS4_Kg7CoqCRD",
  network: Network.ETH_SEPOLIA,
};

async function main() {
  const alchemy = new Alchemy(settings);
  
  // Example 1: Get specific block
  const block = await alchemy.core.getBlock(15221026);
  console.log("Block 15221026:", block);
  
  // Example 2: Get latest block number
  const latestBlock = await alchemy.core.getBlockNumber();
  console.log("Latest block:", latestBlock);
  
  // Example 3: Get token balances (replace with your address)
  const address = "0xYourWalletAddress";
  const balances = await alchemy.core.getTokenBalances(address);
  console.log("Token balances:", balances);
}

main().catch(console.error);