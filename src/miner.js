const BlockChain = require('./blockchain')
const Block = require('./models/block')
const Worker = require('tiny-worker')

const DIFFICULTY = 20000
let isActive = false
const Logger = require('./helpers/Logger')
const logger = new Logger('miner')


async function mineBlock({transactions, lastBlock, address}) {
  const block = Block.create({transactions, lastBlock, address})
  const result = await pow(block)
  return result
}

async function pow(block) {
  return new Promise((resolve, reject) => {

    const worker = new Worker(function() {
      const path = require('path')
      const Block = require(path.resolve(__dirname, '../../../src/models/block'))
      self.onmessage = $event => {
        const {block, difficulty} = $event.data
        while (Block.getDifficulty(block.hash) >= difficulty) {
          block.nonce++
          block.hash = Block.calculateHash(block)
        }
        postMessage({type: 'block', block})
        self.close()
      }
    })
    worker.onmessage = $event => {
      resolve($event.data.block)
    }

    worker.onerror = error => {
      console.log(error)
    }

    worker.postMessage({block, difficulty: DIFFICULTY})
  })

}

module.exports = class Miner {
  static async start(wallet) {
    isActive = true
    logger.info('Start mining:', wallet.public)
    while (isActive) {
      const transactions = await BlockChain.getTransactionForNextBlock()
      const lastBlock = await BlockChain.getLastBlock()
      const block = await mineBlock({
        transactions,
        lastBlock,
        address: wallet.public
      })
      await BlockChain.addBlock({block})
      logger.info(`Add new block: ${block.index}, transactions: ${block.transactions.length}, difficulty: ${Block.getDifficulty(block.hash)}`)
    }
  }
  static stop() {
    isActive = false
  }
}