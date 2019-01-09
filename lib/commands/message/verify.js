'use strict'

const Joi = require('joi')
const crypto = require('../../utils/crypto')
const network = require('../../services/network')
const output = require('../../utils/output')
const networks = require('../../config/networks')
const schema = {
  msg: Joi.string().required(),
  publicKey: Joi.string().hex().required(),
  signature: Joi.string().required()
}

/**
 * @dev Verify <msg> <publickey>.
 * @param {string} msg To verify
 * @param {string} publickey Key to verify with
 * @param {string} signature Signature to verify
 * @param {object} cmd A JSON object containing the options for this query (network, format, verbose).
 */
module.exports = async (msg, publicKey, signature, cmd) => {
  let net = cmd.network ? cmd.network : 'mainnet'
  let format = cmd.format ? cmd.format : 'json'

  // Surpres logging if not --verbose
  if (!cmd.verbose) {
    network.logger.info = () => { }
    network.logger.warn = () => { }
    network.logger.error = (err) => {
      output.showError(err)
    }
  }

  try {
    output.setFormat(format)

    // Validate input
    Joi.validate({
      msg,
      publicKey,
      signature
    }, schema, (err) => {
      if (err) {
        throw new Error(err) // TDOD make error messages more userfriendly
      }
    })

    // Configure network
    if (!networks[net]) {
      throw new Error(`Unknown network: ${net}`)
    }

    // Verify the Message
    const verification = crypto.verify(msg, signature, publicKey)

    if (!verification) {
      throw new Error('Message could not be verified with this key and signature.')
    }

    const result = {
      message: msg,
      verification: 'Verified'
    }
    output.setTitle('PHANTOM Verify message')
    output.showOutput(result)
  } catch (error) {
    output.showError(error.message)
    process.exitCode = 1
  }
}
