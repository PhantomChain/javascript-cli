'use strict'
const phantomchain = require('@phantomchain/crypto')
const phantomUtils = phantomchain.utils
const ECPair = phantomchain.ECPair
const ECSignature = phantomchain.ECSignature
const phantomCrypto = phantomchain.crypto
const transactionBuilder = phantomchain.transactionBuilder

class Crypto {
  getAddress (passphrase, networkVersion) {
    const publicKey = phantomCrypto.getKeys(passphrase).publicKey
    const address = phantomCrypto.getAddress(publicKey, networkVersion)

    return {address, publicKey}
  }

  getAddressFromPublicKey (publicKey, networkVersion) {
    const address = phantomCrypto.getAddress(publicKey, networkVersion)
    return address
  }

  getTransactionBytesHex (transaction) {
    console.log(`Transaction: ${JSON.stringify(transaction)}`)
    return phantomchain.crypto.getBytes(transaction, true, true).toString('hex')
  }

  sign (message, passphrase, networkVersion) {
    const {address, publicKey} = this.getAddress(passphrase, networkVersion)
    const hash = phantomUtils.sha256(Buffer.from(message, 'utf-8'))
    const signature = phantomCrypto.getKeys(passphrase).sign(hash).toDER().toString('hex')

    const result = {
      publicKey,
      address,
      signature,
      message
    }
    return result
  }

  verify (message, signature, publicKey) {
    signature = Buffer.from(signature, 'hex')
    publicKey = Buffer.from(publicKey, 'hex')
    const hash = phantomUtils.sha256(Buffer.from(message, 'utf-8'))
    const ecpair = ECPair.fromPublicKeyBuffer(publicKey)
    const ecsignature = ECSignature.fromDER(signature)
    const verification = ecpair.verify(hash, ecsignature)

    return verification
  }

   registerDelegate (username, passphrase, secondPassphrase, fee) {
    let transaction = transactionBuilder
      .delegateRegistration()
      .usernameAsset(username)
      .fee(fee)
      .sign(passphrase)

    if (secondPassphrase !== null) {
      transaction = transaction.secondSign(secondPassphrase)
    }

    transaction = transaction.getStruct()
    return transaction
  }

  createTransaction (recepient, amount, vendorField, passphrase, secondPassphrase, fee) {
    let transaction = transactionBuilder
      .transfer()
      .amount(amount)
      .recipientId(recepient)
      .vendorField(vendorField)
      .fee(fee)
      .sign(passphrase)

    if (secondPassphrase !== null) {
      transaction = transaction.secondSign(secondPassphrase)
    }

    transaction = transaction.getStruct()
    return transaction
  }

  createVoteTransaction (publicKey, passphrase, secondPassphrase, fee, unvote = false) {
    const votes = []
    let vote
    if (unvote === true) {
      vote = `-${publicKey}`
    } else {
      vote = `+${publicKey}`
    }
    votes.push(vote)

    let transaction = transactionBuilder
      .vote()
      .votesAsset(votes)
      .fee(fee)
      .sign(passphrase)

    if (secondPassphrase !== null) {
      transaction = transaction.secondSign(secondPassphrase)
    }

    transaction = transaction.getStruct()
    return transaction
  }

  createSignatureTransaction (passphrase, secondPassphrase, fee) {
    let transaction = transactionBuilder
      .secondSignature()
      .signatureAsset(secondPassphrase)
      .fee(fee)
      .sign(passphrase)

    transaction = transaction.getStruct()
    return transaction
  }

  getTransactionId (transaction) {
    return phantomCrypto.getId(transaction)
  }
}

module.exports = new Crypto()
