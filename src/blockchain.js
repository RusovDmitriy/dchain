const Block = require('./models/block')
const Wallet = require('./models/wallet')
const Transaction = require('./models/transaction')

const bluebird = require('bluebird')
const redis = require('redis').createClient({port: 6381})
bluebird.promisifyAll(redis)

const KEYS = {
  CHAIN: 'CHAIN',
  TRANSACTIONS: 'TRANSACTION',
  MEMPOOL: 'MEMPOOL'
}

let _init = false

async function getBlocks({start, end}) {
  const blocks = await redis.lrangeAsync(KEYS.CHAIN, start, end)
  return blocks ? blocks.map(block => JSON.parse(block)) : []
}

module.exports = class BlockChain {
  static async init() {
    let lastBlock = await BlockChain.getLastBlock()
    if (!lastBlock) {
      let lastBlock = Block.createGenesis()
      await redis.rpushAsync(KEYS.CHAIN, JSON.stringify(lastBlock))
    }
    _init = true
    return _init
  }

  static async getLastBlock() {
    const blocks = await getBlocks({start: -1, end: -1})
    return blocks[0]
  }

  static async getRangeBlocks({start, end}) {
    const blocks = await getBlocks({start, end})
    return blocks
  }

  static async getBlockTransactions({index = 0}) {
    const data = await redis.lrangeAsync([KEYS.TRANSACTIONS, index].join(':'), 0, -1)
    return data.map(data => Object.assign({block: index}, JSON.parse(data)))
  }

  static async getTransactions({start = 0, end = null, mempool = false}) {
    let result = []
    const length = await redis.llenAsync(KEYS.CHAIN)
    end = end && end < length ? end : length
    for (let index = start; index < end; index++) {
      const blTransactions = await BlockChain.getBlockTransactions({index})
      result = result.concat(blTransactions)
    }
    return result
  }

  static async getTransactionForNextBlock() {
    const data = await redis.lrangeAsync(KEYS.MEMPOOL, 0, -1)
    return data ? data.map(data => JSON.parse(data)) : []
  }

  static async getUnspent({mempool = false}) {
    const transactions = await BlockChain.getTransactions({mempool})
    const inputs = transactions.reduce((inputs, tx) => inputs.concat(tx.inputs), [])
    const outputs = transactions.reduce((outputs, tx) => outputs.concat(tx.outputs.map(o => Object.assign({}, o, {tx: tx.id}))), [])
    const unspent = outputs.filter(output =>
      typeof inputs.find(input => input.tx === output.tx && input.index === output.index && input.amount === output.amount) === 'undefined')
    return unspent
  }

  static async getUnspentForAddress({address}) {
    const unspent = await BlockChain.getUnspent(true)
    return unspent.filter(u => u.address === address)
  }

  static async getBalanceForAddress({address}) {
    const unspent = await BlockChain.getUnspentForAddress({address})
    return unspent.reduce((acc, u) => acc + u.amount, 0)
  }

  static createWallet() {
    return Wallet.create()
  }

  static async removeFromMempool({transactions}) {
    for (let tx of transactions) {
      await redis.lremAsync(KEYS.MEMPOOL, 1, JSON.stringify(tx))
    }
    return true
  }

  static async addBlock({block}) {
    const unspent = await BlockChain.getUnspent({mempool: false})
    let prevBlock = await BlockChain.getLastBlock()
    await Block.validate({prevBlock, block, unspent})

    const transactions = block.transactions
    await redis.rpush([KEYS.TRANSACTIONS, block.index].join(':'), transactions.map(tx => JSON.stringify(tx)))
    await BlockChain.removeFromMempool({transactions})

    const blockHead = Object.assign({}, block)
    delete blockHead.transactions
    await redis.rpushAsync(KEYS.CHAIN, JSON.stringify(blockHead))
  }

  static async addTransaction({transaction}) {
    const unspent = await BlockChain.getUnspent({mempool: true})
    await Transaction.validate({transactions: [transaction], unspent})
    const result = await redis.rpushAsync(KEYS.MEMPOOL, JSON.stringify(transaction))
    return result
  }
}