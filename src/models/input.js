const shajs = require('sha.js')
const Joi = require('joi')
const Wallet = require('./wallet')

function calculateHash({tx, index, amount, address}) {
  const str = JSON.stringify({tx, index, amount, address})
  return shajs('sha256').update(str).digest('hex')
}

function create({tx, index, amount, wallet}) {
  const input = {
    tx,
    index,
    amount,
    address: wallet.public,
  }
  input.signature = Wallet.signHash(wallet.private, calculateHash(input))

  return input
}

function verifySign({tx, index, amount, address, signature}) {
  return Wallet.verifySign({address, signature, hash: calculateHash({tx, index, amount, address})})
}

module.exports = {
  create,
  verifySign,
  calculateHash
}