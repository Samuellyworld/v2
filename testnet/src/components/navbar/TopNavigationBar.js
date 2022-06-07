import algosdk from "algosdk";
import { ASSET_ID } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { useWindowSize } from "@react-hook/window-size";
import { CopyToClipboard } from "react-copy-to-clipboard";
// import GetCommittedAmount from "../GetCommittedAmount";
import corect from '../../assets/correct.png';
import logo from '../../assets/update.png';

import {Link} from 'react-router-dom';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import CountdownTime from "../../statics/CountdownTime";
import './Navbar.scss';

const TopNavigationBar = ({ darkTheme, NavLink }) => {
  const dispatch = useDispatch();

  const addressNum = useSelector((state) => state.status.addressNum);
  const isWalletConnected =
    localStorage.getItem("wallet-type") === null ? false : true;

  const [copyToClipBoard , setCopyToClipBoard] = useState(null)

    const handyCopyToClipBoard = () => {
      setCopyToClipBoard(true)
      setTimeout(() => {
        setCopyToClipBoard(false)
  
      }, 500);
    }

  const LogOut = () => {
    localStorage.removeItem("address");
    localStorage.removeItem("addresses");
    localStorage.removeItem("wallet-type");
    localStorage.removeItem("walletconnect");
    window.location.reload();
    console.log("data");
  };

  const setMode = () => {
    if (!darkTheme) {
      localStorage.setItem("mode", "dark");
      dispatch({ type: "dark_mode" });
    } else {
      localStorage.setItem("mode", "light");
      dispatch({ type: "light_mode" });
    }
  };

 

  const [width] = useWindowSize();
  const [balance, setBalance] = useState([]);

  const algodClient = new algosdk.Algodv2(
    {
      "X-API-Key": ""
    },
    "https://mainnet-algorand.api.purestake.io/ps2",
    ""
  );

  const walletAddress = localStorage.getItem("address");
  const addresses = localStorage.getItem("addresses")?.split(",");

  let addrArr = [];
  

  useEffect(() => {
   
  
    addresses?.forEach(async (item) => {
      const myAccountInfo = await algodClient.accountInformation(item).do();
      const bal =
        myAccountInfo.assets.find((element) => element["asset-id"] === ASSET_ID)
          ?.amount / 100;
        
        
     addrArr.push({ balance: !!bal ? bal : 0, address: item });


    
        dispatch({
          type: "getBalance",
          balance : addrArr
        })
      


      if (addrArr?.length === addresses?.length) {
        dispatch({
          type: "setAlgoAddress",
          addressIndex: 0,
          addr: addrArr[0]?.address,
        });
        setBalance(addrArr);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myAlgoConnect = async () => {
    dispatch({
      type: "confirm_wallet",
      alertContent : "Connecting MyAlgo wallet"
    })

    const myAlgoWallet = new MyAlgoConnect({ shouldSelectOneAccount: false });

    try {
      const accounts = await myAlgoWallet.connect({
        shouldSelectOneAccount: true,
      });

      const addresses = accounts.map((item) => item?.address);
      const address = accounts[0].address;
      

      // close modal.
      localStorage.setItem("wallet-type", "my-algo");
      localStorage.setItem("address", address);
      localStorage.setItem("addresses", addresses);

      window.location.reload();
    } catch (error) {
      dispatch({
        type: "close_wallet"
      })

      dispatch({
        type: "alert_modal",
          alertContent:
            "Error occurred while connecting wallet, Try again later.",
      })
      console.log(error);
    }
  };

  const connectWallet = () => {
  
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: QRCodeModal,
    });

    if (!connector.connected) {
   
      connector.createSession();
    
    }
    // if(!connector.createSession()) {
    //   dispatch({
    //     type: "confirm_wallet",
    //     alertContent : "Error Connecting Pera wallet"
    //   })
    //   setTimeout(() => {
    //     dispatch({
    //       type: "close_wallet"
    //     })
    //   }, 2000)
    // }

    connector.on("connect", (error, payload) => {
      if (error) {
        dispatch({
          type: "confirm_wallet",
          alertContent : "Error Connecting Pera wallet"
        })
        setTimeout(() => {
          dispatch({
            type: "close_wallet"
          })
        }, 2000)
        throw error;
        
      }
          
        dispatch({
          type: "close_wallet"
        })
   

      const { accounts } = payload.params[0];

      const addresses = accounts.map((item) => item);
      const address = accounts[0];

      localStorage.setItem("wallet-type", "walletconnect");
      localStorage.setItem("address", address);
      localStorage.setItem("addresses", addresses);

      window.location.reload();
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        dispatch({
          type: "confirm_wallet",
          alertContent : "Error Connecting Pera wallet"
        })
        setTimeout(() => {
          dispatch({
            type: "close_wallet"
          })
        }, 2000)
        throw error;
      }

      const { accounts } = payload.params[0];

      const addresses = accounts.map((item) => item);
      const address = accounts[0];

      localStorage.setItem("wallet-type", "walletconnect");
      localStorage.setItem("address", address);
      localStorage.setItem("addresses", addresses);

      window.location.reload();
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        dispatch({
          type: "confirm_wallet",
          alertContent : "Error Connecting Pera wallet"
        })

        setTimeout(() => {
          dispatch({
            type: "close_wallet"
          })
        }, 2000)
  
        console.log(error);
      }
    });
  };

  const algoSignerConnect = async () => {
    

    try {
      dispatch({
        type: "confirm_wallet",
        alertContent : "Connecting Algosigner wallet"
      })

      if (typeof window.AlgoSigner === "undefined") {
      
        dispatch({
          type: "confirm_wallet",
          alertContent : "ALgosigner is not set up yet."
        })
      setTimeout(() => {
        dispatch({
          type: "close_wallet"
        })
      }, 4000)
        window.open(
          "https://chrome.google.com/webstore/detail/algosigner/kmmolakhbgdlpkjkcjkebenjheonagdm",
          "_blank"
        );
      } else {
        await window.AlgoSigner.connect({
          ledger: "MainNet",
        });
        const accounts = await window.AlgoSigner.accounts({
          ledger: "MainNet",
        });

        const addresses = accounts.map((item) => item?.address);
        const address = accounts[0].address;

        // close modal.
        localStorage.setItem("wallet-type", "algosigner");
        localStorage.setItem("address", address);
        localStorage.setItem("addresses", addresses);

        window.location.reload();
      }
    } catch (error) {
      dispatch({
        type: "close_wallet"
      })

      dispatch({
        type: "alert_modal",
        alertContent: "AlgoSigner not set up yet!",
      });
    }
  };

  return (
    <header className="small_header">
      <div className="small_header_inn">
      {
        width >= 850 ?
        (
          <div 
          style={{
            display: "flex",
            alignItems: `${width >=  850? "left" : "center"}`,
            justifyContent: `${width >=  850? "left" : "center"}`,
            textTransform: "uppercase",
            flexDirection: "column",
            width : "300px",
            height : "100vh"
          }}>
             <img src={logo} alt="logo" style={{width: "30px"}} />      
            <ul > 
               <li>Voting</li>
               <li>Home</li>
               <li>Faq</li>
            </ul>
          
         </div>
         ) : 
       (
        <div style={{
          display : `${width >=850? "none" : "flex"}`,
          marginTop : "20px",
          justifyContent : `${width <=  850 && "center" }`,
        }}
          > 
           <img src={logo} alt="logo" style={{width: "30px"}} />   
         </div>
       )
        
         }
      
        
       

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!!isWalletConnected ? (
            <>
              <div className="addrDisplay">
                <div className="addrDispMain">
                  <div className="addrDisplayInn">
                    <div className="addrBalance">
                    {balance[addressNum]?.balance.toLocaleString()} <img src="https://i.postimg.cc/mDtpdjqh/logo.png" style={{width : '13px', marginTop : '0px', marginLeft : '2px'}} alt="choice logo"/>
                    </div>

                    <CopyToClipboard text={balance[addressNum]?.address}>
                      <div className="addressTxt">
                        <p>{balance[addressNum]?.address}</p>
                        {copyToClipBoard ? (<img style={{width:'11px'}}
                          src={corect} alt="check"/>) : (<i onClick={() => handyCopyToClipBoard()} className="uil uil-copy"></i>)}
                        
                      </div>
                    </CopyToClipboard>
                  </div>
                </div>

                <div className="dropDownConnect_items">
                  {balance?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="dropDownConnect_item"
                        onClick={() => {
                          dispatch({
                            type: "setAlgoAddress",
                            addressIndex: index,
                            addr: item.address,
                          });
                        }}
                      >
                        <p className="dropDownConnect_item_txt">
                          {item.address}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="dropDownConnect">
              <div className="dropDownConnect_button">
                <button className="connect_wallet_button">
                  <p>
                    Connect Wallet
                    <i
                      className="uil uil-angle-down"
                      style={{ fontSize: "18px" }}
                    />
                  </p>
                </button>
              </div>

              <div className="dropDownConnect_items">
                <div className="dropDownConnect_item" onClick={myAlgoConnect}>
                  <div className="dropDownConnect_img">
                    <img
                      src="https://i.postimg.cc/76r9kXSr/My-Algo-Logo-4c21daa4.png"
                      alt=""
                    />
                  </div>
                  <p className="dropDownConnect_item_txt">My Algo Wallet</p>
                </div>

                <div
                  className="dropDownConnect_item"
                  onClick={algoSignerConnect}
                >
                  <div className="dropDownConnect_img">
                    <img
                      src="https://i.postimg.cc/L4JB4JwT/Algo-Signer-2ec35000.png"
                      alt=""
                    />
                  </div>
                  <p className="dropDownConnect_item_txt">
                    {typeof window.AlgoSigner === undefined
                      ? "Install AlgoSigner"
                      : "AlgoSigner"}
                  </p>
                </div>

                <div className="dropDownConnect_item" onClick={connectWallet}>
                  <div className="dropDownConnect_img">
                    <img
                      src="https://i.postimg.cc/QdXmHSYZ/pera.png"
                      alt=""
                    />
                  </div>
                  <p className="dropDownConnect_item_txt">
                    Pera Wallet
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <div
        style={{
          width: "100%",
          display: "flex",
          fontSize: "12px",
          fontWeight: "500",
          wordSpacing: "1px",
          alignItems: "center",
          color: "var(--wht)",
          padding: "0px 5vw",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          background: "var(--background)",
          height: "var(--sm-hd-height-half)",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-default)",
        }}
      >
        {width > 850 && (
          <ul className="listNavBig">
            <li>
              <NavLink
                style={({ isActive }) => {
                  return {
                    color : isActive ? "var(--nav-active)" : "var(--nav-not-active)",
                    display: "flex",
                    opacity: isActive ? "1" : "0.6",
                    alignItems: "center",
                    flexDirection: "column",
                  };
                }}
                to={`/`}
                key={"home"}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                style={({ isActive }) => {
                  return {
                    color : isActive ? "var(--nav-active)" : "var(--nav-not-active)",
                    display: "flex",
                    opacity: isActive ? "1" : "0.6",
                    alignItems: "center",
                    flexDirection: "column",
                  };
                }}
                to={`/participate`}
                key={"participate"}
              >
                Vote
              </NavLink>
            </li>

            <li>
              <NavLink
                style={({ isActive }) => {
                  return {
                    color : isActive ? "var(--nav-active)" : "var(--nav-not-active)",
                    display: "flex",
                    opacity: isActive ? "1" : "0.6",
                    alignItems: "center",
                    flexDirection: "column",
                  };
                }}
                to={`/faq`}
                key={"faq"}
              >
                FAQ
              </NavLink>
            </li>

            <li className="disconnect" style={{color: 'red', }} onClick={LogOut}>{walletAddress ? "Disconnect" : null}</li>
          </ul>
        )}
        {width > 850 ? (
          <div>
            <CountdownTime />
          </div>
        ) : (
          <div style={{ margin: "auto" }}>
            <CountdownTime />
          </div>
        )}
        
      </div> */}
      {
          width > 850 && (
            <div className="theme-switch-wrapper">
            <label className="theme-switch  ">
                <input id="checkbox" type="checkbox" onChange={setMode} />
                  <i id="toggle-icon" className={`uil ${darkTheme ? "uil-brightness-low" : "uil-moon" } slider round`}></i>
               {/* <img src={dark}  style={{width: "20px"}}  alt="" className=" fa-sun slider round"/> */}
              
            </label>
        </div>
          )
        }
    </header>
  );
};

export default TopNavigationBar;
