const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

describe('Exchange', ()=> {
    let deployer, feeAccount, exchange, token1, user1, user2, accounts
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
        user2 = accounts[3];   

        let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
        await transaction.wait();        

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

            it('emits trder event', async () => {
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

    describe('Orders Actions', () => {
        let transaction, result
        let amount = tokens(1);

        beforeEach( async () => {
            // User 1 approves exchange and deposits token1
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait();

            // User 2 receives token2, approves exchange and deposits token2
            transaction = await token2.connect(deployer).transfer(user2.address, tokens(100));
            result = await transaction.wait();

            transaction = await token2.connect(user2).approve(exchange.address, tokens(2));
            result = await transaction.wait();
            
            transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2));
            result = await transaction.wait();

            // User 1 makes order
            transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
            result = await transaction.wait();
        });
        
        describe('Cancelling orders', async () => {
            describe('Success', async () => {          
                beforeEach(async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result = await transaction.wait();
                });

                it('updates cancelled orders', async () => {
                    expect(await exchange.ordersCancelled(1)).to.equal(true);
                });

                it('emits Cancel event', async () => {
                    const eventLog = result.events[0];
                    expect(eventLog.event).to.equal('Cancel');
    
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
                beforeEach(async () => {
                    transaction = await token1.connect(user1).approve(exchange.address, amount);
                    result = await transaction.wait();
                    transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                    result = await transaction.wait();
        
                    transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
                    result = await transaction.wait();
                });

                it('rejects invalid order ids with no balance', async () => {
                    const invalidOrderId = 99999;
                    await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted;                    
                });                

                it('rejects unauthorized cancellations', async () => {
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
                });
            });
        });

        describe('Filling orders', async () => {      
            describe('Success', async () => {     
                beforeEach(async () => {
                    // user2 fills order
                    transaction = await exchange.connect(user2).fillOrder(1);
                    result = await transaction.wait();
                });

                it('executes the trade and charge fees', async () => {
                    // Token Give
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0))
                    expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1))
                    expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0))
                    // Token get
                    expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1))
                    expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9))
                    expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1))
                });

                it('updates filled orders', async () => {
                    expect(await exchange.ordersFilled(1)).to.equal(true);
                });

                it('emits trade event', async () => {
                    const eventLog = result.events[0];
                    expect(eventLog.event).to.equal('Trade');

                    const args = eventLog.args;
                    expect(args.id).to.equal(1);
                    expect(args.user).to.equal(user2.address);
                    expect(args.tokenGet).to.equal(token2.address);
                    expect(args.amountGet).to.equal(tokens(1));
                    expect(args.tokenGive).to.equal(token1.address);
                    expect(args.amountGive).to.equal(tokens(1));
                    expect(args.creator).to.equal(user1.address);
                    expect(args.timestamp).to.at.least(1);
                });
            });

            describe('Failure', async () => {
                let transaction;
                it('rejects invalid order id', async () => {
                    const invalidOrderId = 99999;
                    await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted;                    
                });

                it('rejects filled orders', async () => {
                    transaction = await exchange.connect(user2).fillOrder(1);
                    await transaction.wait();

                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
                });

                it('rejects cancelled orders', async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    await transaction.wait();
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;    
                });
            });
        });
    });
});