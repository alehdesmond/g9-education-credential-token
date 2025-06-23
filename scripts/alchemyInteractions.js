// scripts/alchemyInteractions.js
require('dotenv').config();
const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

async function main() {
  const alchemy = new Alchemy(settings);
  
  // Example 1: Get latest block
  const latestBlock = await alchemy.core.getBlockNumber();
  console.log("Latest block:", latestBlock);
  
  // Example 2: Get token balances (replace with your contract address)
  const address = "0x4141a275C2CF4F6370157F0B00b41Cfa30123Ee4";
  const balances = await alchemy.core.getTokenBalances(address);
  console.log("Token balances:", balances);
}

main().catch(console.error);