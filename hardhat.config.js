require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // ✅ Load environment variables


module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // 🔒 fallback to empty string
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] // 🔒 fallback to empty array
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "21DM2YE6H76WKNKAFISY9ZG5W6DP9BEYFU"
  }
};
