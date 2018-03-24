const BlockChain = require('./src/blockchain')
const Miner = require('./src/miner')
const Api = require('./src/api')


async function init(params) {
  try {
    const wallet = BlockChain.createWallet()
    await BlockChain.init()
    await Miner.start(wallet)
  } catch (e) {
    console.log(e)
  }
}

init()