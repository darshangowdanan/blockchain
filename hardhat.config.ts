require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // Matches the version commonly used
  networks: {
    // Local Network (Free & Fast)
    hardhat: {
      chainId: 1337
    },
    // Polygon Amoy (Public Testnet)
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};