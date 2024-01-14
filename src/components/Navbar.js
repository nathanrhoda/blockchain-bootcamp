import { useSelector, useDispatch  } from "react-redux";
import Blockies from 'react-blockies';
import logo from '../assets/logo.png'
import { 
          loadAccount,
        } from '../store/interactions'

const Navbar = () => {
    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)
    const balance = useSelector(state => state.provider.balance)

    const dispatch = useDispatch();

    const connectHandler = async () => {        
        await loadAccount(provider, dispatch);
    };

    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <h1>My Exchange</h1>
            <img src={logo} className='logo' alt="MyExchangeLogo"></img>
        </div>
  
        <div className='exchange__header--networks flex'>
  
        </div>
  
        <div className='exchange__header--account flex'>
            {balance? (
                <p><small>My Balance</small>{Number(balance).toFixed(4)} ETH</p>
                ): (
                <p><small>My Balance</small>0 ETH</p>
            )}           
            {account ? (
                <a href=".">
                    {account.slice(0,5) + '...' + account.slice(38,42)}
                    <Blockies 
                        account={account}
                        size={10}
                        scale={3}
                        color="#2187D0"
                        bgColor="#F1F2F9"
                        spotColor="#767F92"
                        className="identicon"
                        seed="foo"
                    />
                </a> 
                ): (
                <button className="button" onClick={connectHandler}>Connect</button>
            )}
        </div>
      </div>
    )
  }
  
  export default Navbar;