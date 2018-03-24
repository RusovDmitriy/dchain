const crypto = require('crypto')
const moment = require('moment')
const shajs = require('sha.js')
const Joi = require('joi')

const miningReward = 100

const {TransactionError} = require('../helpers/errors')
const Wallet = require('./wallet')
const Input = require('./input')



const transactionSchema = Joi.object().keys({
  id: Joi.string().hex().length(64),
  timestamp: Joi.number(),
  hash: Joi.string().hex().length(64),
  reward: Joi.boolean(),
  inputs: Joi.array().items(Joi.object().keys({
    tx: Joi.string().hex().length(64),
    index: Joi.number(),
    amount: Joi.number(),
    address: Joi.string(),
    signature: Joi.string().base64(),
  })),
  outputs: Joi.array().items(Joi.object().keys({
    index: Joi.number(),
    amount: Joi.number(),
    address: Joi.string(),
  }))
})

/** VALIDATE */
function validateSchema(transaction) {
  return Joi.validate(transaction, transactionSchema).error === null
}

function calculateHash({id, timestamp, inputs, outputs}) {
  const str = JSON.stringify({id, timestamp, inputs, outputs})
  return shajs('sha256').update(str).digest('hex')
}




function validateTransaction({tx, unspent}) {
  if (!validateSchema(tx)) throw new TransactionError('Invalid schema')
  if (tx.hash !== calculateHash(tx)) throw new TransactionError('Invalid transaction hash')

  tx.inputs.forEach(input => {
    if (!Input.verifySign(input)) throw new TransactionError('Invalid input signature')
  })
}

function validate({transactions, unspent}) {
  if (!(transactions instanceof Array)) transactions = [transactions]
  transactions.forEach(tx => validateTransaction({tx, unspent}))
}

function create({inputs, outputs, reward = false}) {
  const tx = {
    id: crypto.randomBytes(32).toString('hex'),
    timestamp: moment().unix(),
    reward,
    inputs,
    outputs
  }

  tx.hash = calculateHash(tx)
  return tx
}

function createReward(address) {
  return create({
    inputs: [],
    outputs: [{index: 0, amount: miningReward, address}],
    reward: true
  })
}

function build({wallet, to, amount, unspent}) {

  let inputsAmount = 0
  const inputsRaw = unspent.filter(i => {
    const more = inputsAmount < amount
    if (more) inputsAmount += i.amount
    return more
  })
  if (inputsAmount < amount) throw new TransactionError('Not enough funds')
  const inputs = inputsRaw.map(input => Input.create({wallet, ...input}))
  const outputs = [{index: 0, amount, address: to}]
  if (inputsAmount - amount > 0)
    outputs.push({index: 1, amount: inputsAmount - amount, address: wallet.public})

  return create({inputs, outputs})
}

module.exports = {
  validate,
  build,
  createReward
}