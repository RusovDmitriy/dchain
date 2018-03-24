const BlockChain = require('../blockchain')
const Transaction = require('../models/transaction')

const actions = {
  async get_blocks({start, end, withTx = false}) {
    const result = await BlockChain.getRangeBlocks({start, end})
    return result
  },

  async get_transactions({start, end}) {
    const result = await BlockChain.getTransactions({start, end})
    return result
  },

  async get_balance({address}) {
    const balance = await BlockChain.getBalanceForAddress({address})
    return balance
  },

  async send({wallet, to, amount}) {
    const unspent = await BlockChain.getUnspentForAddress({address: wallet.public})
    const transaction = Transaction.build({wallet, to, amount, unspent})
    const result = await BlockChain.addTransaction({transaction})
    return result
  }
}

const providers = {
  http: require('./providers/http')(actions)
}

module.exports = actions