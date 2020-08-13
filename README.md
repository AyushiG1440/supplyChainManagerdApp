# supplyChainManagerdApp
Decentralized application designed for supply chain management (or can be modified for E-commerce purposes)
Software requirements:

Software requirements:
1) Truffle v4.0.4
2) Solidity(solc) v0.4.18
3) Node.js v9.4.0
4) Metamask chrome plugin

(PS-change name src v0.3 to src)
  To test the application on local blockchain developed using truffle, first clone this repository.
  Then in terminal(1), find path to the root file of this repository (i.e supplyChain folder).
  Run the command "Truffle compile". 
  In a new terminal, find path to the root file and run command "truffle develop". Use the seed phrase created to activate metamask wallet.
  In terminal(1), run the command "truffle migrate -- reset".
  You can run the test files using the command "tuffle test" in terminal(1).
  To run the application, run the command "npm run dev".
  
  In the metamask plugin, create a network for http://localhost:9545 and connect to this network. Make sure to connect the accounts to localhost:3000 to interface metamask with dApp.
download node-modules setup files too 
