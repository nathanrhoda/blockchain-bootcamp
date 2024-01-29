const hre = require("hardhat");
const config = require('../src/config.json');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

const wait = (seconds) => {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000)
    })
}

async function main() {
    const accounts = await ethers.getSigners();

    const { chainId }  = await hre.ethers.provider.getNetwork();
    console.log(`Chain ID: ${chainId}\n`);

    const Wzar = await ethers.getContractAt('Token', config[chainId].WZAR.address);
    console.log(`Wzar fetched to: ${Wzar.address}\n`);

    const Btc = await ethers.getContractAt('Token', config[chainId].BTC.address);
    console.log(`Btc fetched to: ${Btc.address}\n`);

    const Eth = await ethers.getContractAt('Token', config[chainId].ETH.address);
    console.log(`Eth fetched to: ${Eth.address}\n`);

    const exchange = await ethers.getContractAt('Exchange', config[chainId].Exchange.address);
    console.log(`Exchange fetched to: ${exchange.address}\n`);

    const sender = accounts[0];
    const receiver = accounts[1];
    let amount = tokens(10000);

    let transaction, result;

    // Send some tokens to receiver / user2
    transaction = await Btc.connect(sender).transfer(receiver.address, amount);
    console.log(`Transferred ${amount} Btc from ${sender.address} to ${receiver.address}\n`);

    const user1 = accounts[0];
    const user2 = accounts[1];
    amount = tokens(10000);

    // Move tokens to exchange on behlaf of users and approve exchange to spend them
    transaction = await Wzar.connect(user1).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} Wzar from ${user1.address}\n`); 

    transaction = await exchange.connect(user1).depositToken(Wzar.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} Wzar from ${user1.address}\n`);

    transaction = await Btc.connect(user2).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} Btc from ${user2.address}\n`); 

    transaction = await exchange.connect(user2).depositToken(Btc.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} Btc from ${user2.address}\n`);
    

    // // Cancel Orders
    // let orderId
    // transaction = await exchange.connect(user1).makeOrder(Btc.address, tokens(100), Wzar.address, tokens(5)) 
    // result = await transaction.wait()
    // console.log(`Made order from ${user1.address}\n`);

    // console.log(result);
    // orderId = result.events[0].args.id;
    // transaction = await exchange.connect(user1).cancelOrder(orderId);
    // result = await transaction.wait();
    // console.log(`Cancelled order from ${user1.address}\n`);

    // await wait(1);

    // // Fill & Cancel Orders
    // transaction = await exchange.connect(user1).makeOrder(Btc.address, tokens(100), Wzar.address, tokens(10));
    // result = await transaction.wait();
    // console.log(`Made order from ${user1.address}\n`);

    // orderId = result.events[0].args.id;
    // transaction = await exchange.connect(user2).fillOrder(orderId); 
    // result = await transaction.wait();
    // console.log(`Filled order from ${user1.address}\n`);

    // await wait(1);

    // transaction = await exchange.connect(user1).makeOrder(Btc.address, tokens(50), Wzar.address, tokens(15));
    // result = await transaction.wait();
    // console.log(`Made order from ${user1.address}\n`);

    // orderId = result.events[0].args.id;
    // transaction = await exchange.connect(user2).fillOrder(orderId); 
    // result = await transaction.wait();
    // console.log(`Filled order from ${user1.address}\n`);

    // await wait(1);

    // transaction = await exchange.connect(user1).makeOrder(Btc.address, tokens(200), Wzar.address, tokens(20));
    // result = await transaction.wait();
    // console.log(`Made order from ${user1.address}\n`);

    // orderId = result.events[0].args.id;
    // transaction = await exchange.connect(user2).fillOrder(orderId); 
    // result = await transaction.wait();
    // console.log(`Filled order from ${user1.address}\n`);

    // await wait(1);

    // for(let i = 1; i <= 10; i++) {
    //     transaction = await exchange.connect(user1).makeOrder(Btc.address, tokens(10*i), Wzar.address, tokens(10));
    //     result = await transaction.wait();
    //     console.log(`Made order from ${user1.address}\n`);
    // }
    
    // await wait(1);

    // for(let i = 1; i <= 10; i++) {
    //     transaction = await exchange.connect(user2).makeOrder(Wzar.address, tokens(10), Btc.address, tokens(10*1));
    //     result = await transaction.wait();
    //     console.log(`Made order from ${user2.address}\n`);
    // }

    await wait(1);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
