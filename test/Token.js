const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

describe('Token', ()=> {
    let token    
    let tokenName = 'My Token';
    let symbol = 'MT';
    let totalSupply = 1000000;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy(tokenName, symbol, totalSupply);
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
    });
});