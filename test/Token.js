const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

describe('Token', ()=> {
    let token, accounts, deployer    
    let tokenName = 'My Token';
    let symbol = 'MT';
    let totalSupply = 1000000;    

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy(tokenName, symbol, totalSupply);

        accounts = await ethers.getSigners();
        deployer = accounts[0];
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
});