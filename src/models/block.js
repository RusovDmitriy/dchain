const shajs = require('sha.js')
const moment = require('moment')
const Joi = require('joi')

const {BlockError} = require('../helpers/errors')
const Transaction = require('./transaction')

const blockSchema = Joi.object().keys({
  index: Joi.number(),
  timestamp: Joi.number(),
  transactions: Joi.array(),
  prevHash: Joi.string().hex().length(64),
  nonce: Joi.number(),
  hash: Joi.string().hex().length(64)
})

function validateSchema(block) {
  return Joi.validate(block, blockSchema).error === null
}

function getDifficulty(hash) {
  return parseInt(hash.substring(0, 8), 16)
}

function calculateHash({index, timestamp, transactions, prevHash, nonce}) {
  return shajs('sha256').update(JSON.stringify({index, timestamp, transactions, prevHash, nonce})).digest('hex')
}

function createGenesis() {
  return {
    index: 0,
    timestamp: moment().unix(),
    transactions: [],
    prevHash: "0",
    hash: "0ee50ab5abc227334f06b9461b8290260e50e6224166320bb03aa46bb7c80682"
  }
}

function create({transactions, lastBlock, address}) {
  transactions = transactions.slice()
  transactions.push(Transaction.createReward(address))
  const block = {
    index: lastBlock.index + 1,
    prevHash: lastBlock.hash,
    timestamp: Math.floor(new Date().getTime() / 1000),
    transactions,
    nonce: 0,
  }
  block.hash = calculateHash(block)

  return block
}


async function validate({prevBlock, block, unspent}) {
  if (!validateSchema(block)) throw new BlockError('Invalid schema')
  if (prevBlock.index + 1 !== block.index) throw new BlockError('Invalid block index')
  if (prevBlock.hash !== block.prevHash) throw new BlockError('Invalid block prevHash')
  if (calculateHash(block) !== block.hash) throw new BlockError('Invalid block hash')

  const transactions = block.transactions
  if (transactions.filter(tx => tx.reward).length !== 1) throw new BlockError('Block of transactions must have 1 reward')
  await Transaction.validate({transactions, unspent})
}

module.exports = {
  validate,
  calculateHash,
  createGenesis,
  getDifficulty,
  create
}