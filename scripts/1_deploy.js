const hre = require("hardhat");

async function main() {
  // Fetch contract to deploy
  const Exchange = await ethers.getContractFactory('Exchange');
  const Token = await ethers.getContractFactory('Token');

  const accounts = await ethers.getSigners();
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)
  // Deploy contract  
  const wZar = await Token.deploy('Wrapped Zar', 'wZar', '1000000')  
  await wZar.deployed()
  console.log(`wZar deployed to: ${wZar.address}\n`);

  const btc = await Token.deploy('Bitcoin', 'BTC', '1000000');
  await btc.deployed()
  console.log(`BTC deployed to: ${btc.address}\n`);

  const eth = await Token.deploy('Ethereum', 'ETH', '1000000');  
  await eth.deployed()
  console.log(`ETH deployed to: ${eth.address}\n`);  

  const exchange = await Exchange.deploy(accounts[1].address, 10);  
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}\n`);    
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
