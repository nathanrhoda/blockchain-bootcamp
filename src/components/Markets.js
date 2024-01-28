import { useSelector, useDispatch  } from "react-redux";

import config from '../config.json';

import { loadTokens } from "../store/interactions";

const Markets = () => {
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)  
    const dispatch = useDispatch();

    const marketHandler = async (e) => {
        console.log('market changed...')                
        loadTokens(provider, (e.target.value).split(','), dispatch)
    }
    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>
        {
            chainId && config[chainId] ? (
                <select name="markets" id="markets" onChange={marketHandler}>
                    <option value={`${config[chainId].WZAR.address},${config[chainId].BTC.address}`}>WZAR / BTC</option>
                    <option value={`${config[chainId].WZAR.address},${config[chainId].ETH.address}`}>WZAR / ETH</option>
                    {/* <option value={`${config[chainId].BTC.address}, ${config[chainId].ETH.address}`}>WZAR / ETH</option> */}
            </select>
            ) : (
                <div>
                    <p>Not deployed to network</p>
                </div>
            )}        
        <hr />
      </div>
    )
  }
  
  export default Markets;