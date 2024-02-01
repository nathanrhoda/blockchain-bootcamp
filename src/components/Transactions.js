import { myOpenOrdersSelector, myFilledOrdersSelector } from "../store/selectors";
import { useState, useRef } from 'react';
import { useSelector } from "react-redux"; 
import sort from '../assets/sort.svg';
import Banner from "./Banner";

const Transactions = () => {  
    const myOpenOrders = useSelector(myOpenOrdersSelector)
    const myFilledOrders = useSelector(myFilledOrdersSelector)
    const symbols = useSelector(state => state.tokens.symbols)
    const [showMyOrders, setshowMyOrders] = useState(true)
    const orderRef = useRef(null)
    const tradeRef = useRef(null)

    const tabHandler = (e) => {
      if (e.target.className !== orderRef.current.className) {
        e.target.className = 'tab tab--active'
        orderRef.current.className = 'tab'
        setshowMyOrders(false)
      } else {
        e.target.className = 'tab tab--active'
        tradeRef.current.className = 'tab'
        setshowMyOrders(true)
      }
    }

    return (
      <div className="component exchange__transactions">
        {showMyOrders ? (        
          <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>
    
              <div className='tabs'>
                <button onClick={tabHandler} ref={orderRef} className='tab tab--active' >Orders</button>
                <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
              </div>
            </div>
            {!myOpenOrders || myOpenOrders.length === 0 ? (
              <Banner text='No Orders' />
              ):(

              
              <table>
                <thead>
                  <tr>
                    <th>Time<img src={sort} alt="Sort" /></th>
                    <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                    <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                  </tr>
                </thead>
                <tbody>
                  {myOpenOrders && myOpenOrders.map((order, index) => {
                    return(                
                      <tr key={index}>
                        <td style={{color:`${order.orderTypeClass}`}}>{order.token0Amount}</td>
                        <td>{order.tokenPrice}</td>
                        <td>{/* TODO: Cancel Order */}</td>
                      </tr>
                      )
                  })}
                </tbody>
              </table>
            )}
          </div>
          ):(
          <div>
            <div className='component__header flex-between'>
              <h2>My Transactions</h2>
    
              <div className='tabs'>
                <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
              </div>
            </div>
    
            <table>
              <thead>
                <tr>
                    <th>Time<img src={sort} alt="Sort" /></th>
                    <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                    <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                </tr>
              </thead>
              <tbody>
                {myFilledOrders && myFilledOrders.map((order, index) => {
                  return(
                    <tr key={index}>                    
                      <td>{order.formattedTimestamp}</td>
                      <td style={{color: `${order.orderClass}`}}>{order.orderSign}{order.token0Amount}</td>
                      <td>{order.tokenPrice}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
    
          </div>
        )}
      </div>
    )
  }
  
  export default Transactions;