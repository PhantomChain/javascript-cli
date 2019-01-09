const logger = require('../services/logger')
const crypto = require('../utils/crypto')

class Ledger {
  setNetwork (network) {
    if (network.hasOwnProperty('network') && network.network.hasOwnProperty('version')) {
      this.network = network
      this.networkVersion = this.network.network.version
      return this.network
    }
    throw new Error('not a valid network')
  }

  async isSupported () {
    if (typeof (this.PHANTOMLedger) === 'undefined') {
      try {
        await this.__initLedger()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(new Error('Ledger is not supported (does this machine have a USB port?).'))
      }
    }
  }

  async connect () {
    try {
      let comm = await this.ledgerco.comm_node.create_async()
      await this.LedgerPhantom.setComm(comm)
      let config = await this.LedgerPhantom.getAppConfiguration()
      logger.info(`Ledger connected, PHANTOM v${config.version}`)
      return Promise.resolve()
    } catch (error) {
      let errorMsg
      switch (error) {
        case 'Invalid status 6d00':
          errorMsg = 'Ledger device found, please activate the PHANTOM app.'
          break
        case 'Invalid channel;':
          errorMsg = 'Ledger device found, please de-activate "Browser support".'
          break
        default:
          errorMsg = 'Please connect your Ledger and activate the PHANTOM app first.'
      }
      return Promise.reject(new Error(errorMsg))
    }
  }

  async getBip44Accounts (slip44 = null) {
    if (!slip44) {
      slip44 = this.network.network.slip44 ? this.network.network.slip44 : 111
    }

    let ledgerAccounts = []
    let i = 0
    let empty = true
    let publicKey
    while (empty) {
      let localpath = `44'/${slip44}'/${i}'/0/0`
      publicKey = await this.LedgerPhantom.getPublicKey(localpath)
      try {
        let account = await this.__getAccount(publicKey)
        if (account) {
          ledgerAccounts.push(account)
        }
        logger.info(`Ledger: Account found with address ${account.address}`)
        i++
      } catch (error) {
        // this is the first unused account on this ledger,and it's not known to the network
        const address = crypto.getAddressFromPublicKey(publicKey, this.networkVersion)
        let account = {
          address,
          publicKey,
          'Status': 'Address unknown to the network'
        }
        ledgerAccounts.push(account)
        empty = false
      }
    }

    return ledgerAccounts
  }

  async signTransaction (path, transaction) {
    logger.warn('Please confirm your transaction on your Ledger device!')
    try {
      let transactionHex = crypto.getTransactionBytesHex(transaction)
      let result = await this.LedgerPhantom.signTransaction(path, transactionHex)
      return result.signature
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // TODO Implement this correctly, after it is implemented on the Ledger app
  // async signMessage (path, message) {}

  async __getAccount (publicKey) {
    const address = crypto.getAddressFromPublicKey(publicKey, this.networkVersion)
    try {
      const result = await this.network.getFromNode(`/api/v2/wallets/${address}`)
      if (result !== null) {
        const account = result.data.data
        if (account.publicKey === null) {
          account.publicKey = publicKey
        }
        return Promise.resolve(account)
      }
      return Promise.resolve()
    } catch (error) {
      console.log(error)
      return Promise.reject(error)
    }
  }

  async __initLedger () {
    try {
      this.ledgerco = require('ledgerco')
      this.LedgerPhantom = require('./LedgerPhantom.js')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
module.exports = new Ledger()
module.exports.logger = logger
