require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */


module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {}
  },
  paths: {
    tests: "./test",
  },
  mocha: {
    timeout: 60000, // Increase the timeout to 60 seconds (or any value you prefer)
  }
};
