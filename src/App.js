
import React, { useState, useEffect } from 'react';

import './App.css';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import algosdk from "algosdk";
// import { Button, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const myAlgoConnect = new MyAlgoConnect();
const algodClient = new algosdk.Algodv2("",'	https://testnet-api.algonode.cloud', '');
const indexClient = new algosdk.Indexer('', 'https://testnet-idx.algonode.cloud', '');

 

// Function Borrowed from Algorand Inc.
const waitForConfirmation = async function (algodClient, txId) {
   let lastround = (await algodClient.status().do())['last-round'];
    while (true) {
       const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
       if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
         //Got the completed Transaction
         console.log('Transaction confirmed in round ' + pendingInfo['confirmed-round']);
         break;
       }
       lastround++;
       await algodClient.statusAfterBlock(lastround).do();
    }
};

function App() {
  const [currentAccount, setCurrentAccount] = useState();
  const [connector, setConnector] = useState();
  const connect=async()=>
  {
    const settings = {
      
      shouldSelectOneAccount: false,
      openManager: false
  };
  const accounts = await myAlgoConnect.connect(settings);
  const addresses = accounts.map((account) => account.address);
  console.log(addresses[0]);
  localStorage.setItem("address",addresses[0]);//connected address stored as a cookie
  toast.success('Connected successfully', {position: "bottom-right",autoClose: 5000,hideProgressBar: false,closeOnClick: true,pauseOnHover: true,draggable: true,progress: undefined,theme: "light",});
  }
  const disconnect=async()=>
  {
    
  localStorage.removeItem("address");//connected address stored as a cookie
  toast.success('Disconnected successfully', {position: "bottom-right",autoClose: 5000,hideProgressBar: false,closeOnClick: true,pauseOnHover: true,draggable: true,progress: undefined,theme: "colored",});
  
  }
  const create_account=async()=>
  {
    
    var account = algosdk.generateAccount();
    var passphrase = algosdk.secretKeyToMnemonic(account.sk);
    console.log( "My address: " + account.addr );
    console.log( "My passphrase: " + passphrase );
  }

 
  const transact=async()=>
  { const algosdk = require('algosdk');
    const mnemonic = document.getElementById('mnemonic').value;
    const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
    let receiver=document.getElementById("ID").value;
    let amount = parseInt(document.getElementById("firstnumber").value);
    amount=amount*1000000
  
    const params = await algodClient.getTransactionParams().do();

    let txn = {
      "from": recoveredAccount.addr,
      "to": receiver,
      "amount": amount,
      "fee": params.fee,
      "firstRound": params.firstRound,
      "lastRound": params.lastRound,
      "genesisID": params.genesisID,
      "genesisHash": params.genesisHash,
      "note": new Uint8Array(0),
  };

    const signedTxn = algosdk.signTransaction(txn, recoveredAccount.sk);
    const sendTx = await algodClient.sendRawTransaction(signedTxn.blob).do();//blob-in format of unit-8 array
    setConnector("https://testnet.algoexplorer.io/tx/"+sendTx.txId);
    waitForConfirmation(algodClient, sendTx.txId);
    toast.success('Transaction completed successfully', {position: "bottom-right",autoClose: 5000,hideProgressBar: false,closeOnClick: true,pauseOnHover: true,draggable: true,progress: undefined,theme: "dark",});
  
  
  }

  const openwallet = () => {
    window.open('https://wallet.myalgo.com', '_blank');
  };
  return (
    
    <div className="App">
      <ToastContainer />
      <button onClick={connect}>New connect</button>
      <button onClick={transact}>Transaction</button>
      
      <p>amount: <input id="firstnumber"></input></p>
      <p>account: <input id="ID"></input></p>
      <p>mnemonic: <input id="mnemonic"></input></p>
      {/* <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      /> */}
      <button onClick={disconnect}>Disconnect</button>
      {connector && <a href={connector}>View Transaction</a>}
      <button onClick={create_account}>create_account</button>
      <button onClick={openwallet}>Open Algowallet</button>
    </div>
   
  );
  }

export default App;
