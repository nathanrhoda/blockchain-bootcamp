const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

describe('Token', ()=> {
    let token, accounts, deployer, receiver    
    let tokenName = 'My Token';
    let symbol = 'MT';
    let totalSupply = 1000000;    

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy(tokenName, symbol, totalSupply);
        
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
    });

    describe('Deployment', () => {
        it('has correct name', async () =>  {
            expect(await token.name()).to.equal(tokenName);                
        });
    
        it('has correct symbol', async () => {        
            expect(await token.symbol()).to.equal(symbol);                
        });
    
        it('has 18 decimals', async () => {        
            expect(await token.decimals()).to.equal('18');                
        });
    
        it('has correct totalSupply', async () => {    
            expect(await token.totalSupply()).to.equal(tokens(totalSupply));                
        });

        it('assigns totalSupply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(totalSupply));
        });
    });

    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Success', () => {
        
            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount);            
                result = await transaction.wait();               
            });

            it('transfers token balances',async () => {               
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(totalSupply).sub(amount));
                expect(await token.balanceOf(receiver.address)).to.equal(amount);                        
            });

            it('emits Transfer event', async () => {
                const eventLog = result.events[0];
                expect(eventLog.event).to.equal('Transfer');
                expect(eventLog.args.from).to.equal(deployer.address);
                expect(eventLog.args.to).to.equal(receiver.address);
                expect(eventLog.args.value).to.equal(amount);
            });
        });

        describe('Failure', () => {
            it('rejects insufficient balances', async () => {
                let invalidAmount = tokens(100000000);
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;                
            });            
        });
    });
    
});