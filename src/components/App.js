import { useEffect } from 'react';
import { useDispatch  } from "react-redux";
import config from '../config.json';
import { 
          loadProvider, 
          loadNetwork, 
          loadAccount,
          loadTokens,
          loadExchange,
          subscribeToEvents, 
          loadAllOrders
        } from '../store/interactions';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {                
    // Connect ethers to blockchain
    const provider = loadProvider(dispatch)    
    
    const chainId = await loadNetwork(provider, dispatch)

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch);
    })
    

    // Token Smart Contract
    const Wzar = config[chainId].WZAR.address
    const Btc = config[chainId].BTC.address
    const Eth = config[chainId].ETH.address
  
    await loadTokens(provider, [Wzar, Btc, Eth], dispatch)
        
    const exchange = await loadExchange(provider, config[chainId].Exchange.address, dispatch)

    loadAllOrders(provider, exchange, dispatch)
    
    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => { 
    loadBlockchainData()
  })
  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          <OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;