const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

describe('Exchange', ()=> {
    let deployer, feeAccount, exchange, token1, user1, accounts
    let tokenName = 'My Token';
    let symbol = 'MT';
    let totalSupply = '1000000';    

    const feePercent = 10;

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange');
        const Token = await ethers.getContractFactory('Token');

        token1 = await Token.deploy('Token1', 'TK1', totalSupply);
        token2 = await Token.deploy('Token2', 'TK2', totalSupply);

        accounts = await ethers.getSigners();
        deployer = accounts[0];    
        feeAccount = accounts[1];   
        user1 = accounts[2];   

        let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
        await transaction.wait();

        // transaction = await token2.connect(deployer).transfer(exchange.address, tokens(100));
        // await transaction.wait();

        exchange = await Exchange.deploy(feeAccount.address, feePercent);        
    });

    describe('Deployment', () => {
        it('tracks the fee account', async () =>  {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);                
        });

        it('tracks the fee percent', async () =>  {
            expect(await exchange.feePercent()).to.equal(feePercent);                
        });
    });
    

    describe('Depositing Tokens', () => {
        let transaction, result

        let amount = tokens(10)

        describe('Success', () => {
            beforeEach( async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();
            });

            it('tracks the token deposit', async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount);
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
            });            

            it('emits Deposit event', async () => {
                const eventLog = result.events[1];
                expect(eventLog.event).to.equal('Deposit');
                expect(eventLog.args.token).to.equal(token1.address);
                expect(eventLog.args.user).to.equal(user1.address);
                expect(eventLog.args.amount).to.equal(amount);
                expect(eventLog.args.balance).to.equal(amount);
            });
        });
        
        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;                        
            });
        });
    });


    describe('Withdraw Tokens', () => {
        let transaction, result

        let amount = tokens(10)

        describe('Success', () => {
            beforeEach( async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();

                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount);
                result = await transaction.wait();
            });

            it('withdraws token funds', async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(0);
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0);
            });            

            it('emits Withdraw event', async () => {
                const eventLog = result.events[1];
                expect(eventLog.event).to.equal('Withdraw');
                expect(eventLog.args.token).to.equal(token1.address);
                expect(eventLog.args.user).to.equal(user1.address);
                expect(eventLog.args.amount).to.equal(amount);
                expect(eventLog.args.balance).to.equal(0);
            });
        });
        
        describe('Failure', () => {
            it('fails for insufficient balance', async () => {
                await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted;                        
            });
        });
    });

    describe('Checking Balances', () => {
        let transaction, result

        let amount = tokens(1)

        describe('Success', () => {
            beforeEach( async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();
            });

            it('returns user balances', async () => {
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
            });            
        });    
    });

    describe('Making Orders', () => {
        let transaction, result
        let amount = tokens(1);

        describe('Success', async () => {
            beforeEach(async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();

                transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
                result = await transaction.wait();
            });

            it('tracks the newly created order', async () => {
                expect(await exchange.orderCount()).to.equal(1);                    
            });

            it('emits Order event', async () => {
                const eventLog = result.events[0];
                expect(eventLog.event).to.equal('Order');

                const args = eventLog.args;
                expect(args.id).to.equal(1);
                expect(args.user).to.equal(user1.address);
                expect(args.tokenGet).to.equal(token2.address);
                expect(args.amountGet).to.equal(tokens(1));
                expect(args.tokenGive).to.equal(token1.address);
                expect(args.amountGive).to.equal(tokens(1));
                expect(args.timestamp).to.at.least(1);
            });
        });

        describe('Failure', async () => {
            it('rejects orders with no balance', async () => {
                await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted;                    
            });
        });
    });
});