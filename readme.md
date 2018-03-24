# Node.js + redis simple blockchain

**Status**: In develop

## Features

* BlockChain structure in redis storage
* UTXO model
* POW Mining
* Simple json-rpc api
* Wallets and transactions 

## Coming soon

* Peers and nodes communication
* WebSockets API provider
* Extend api and blockchain features
* BlockChain explorer and wallet gui
* Errors handler
* Documentation
* Tests

## Install

* Node.js > v8.9.1
* Docker-compose 3.1

```bash
git clone git@github.com:RusovDmitriy/dchain.git
cd dchain & npm i
docker-compose up -d
npm start
```