require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    matic: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/<API_key>",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
    },
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337
    },
  },
};
