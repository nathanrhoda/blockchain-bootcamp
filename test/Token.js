const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString());
}

describe('Token', ()=> {
    let token    

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy();
    });

    it('has correct name', async () =>  {
        expect(await token.name()).to.equal("My Token");                
    });

    it('has correct symbol', async () => {        
        expect(await token.symbol()).to.equal("MT");                
    });

    it('has 18 decimals', async () => {        
        expect(await token.decimals()).to.equal('18');                
    });

    it('has correct totalSupply', async () => {    
        expect(await token.totalSupply()).to.equal(tokens('1000000'));                
    });
});