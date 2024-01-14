import { useEffect } from 'react';
import { ethers } from 'ethers';
import WZAR_ABI from '../abis/Token.json';
import config from '../config.json';
import '../App.css';

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    console.log(accounts[0])

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()

    const wzar = new ethers.Contract( config[chainId].WZAR.address, WZAR_ABI, provider)
    console.log(wzar.address)

    const symbol = await wzar.symbol();
    console.log(symbol)

    // const exchange = new ethers.Contract( config[chainId].Exchange.address, Exchange_ABI, provider)

  }

  useEffect(() => { 
    loadBlockchainData()
  })
  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;