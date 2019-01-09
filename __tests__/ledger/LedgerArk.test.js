'use strict'

const LedgerPhantom = require('../../lib/ledger/LedgerPhantom.js')

describe('LedgerPhantom', () => {
  it('should be an object', () => {
    expect(LedgerPhantom).toBeObject()
  })
})

describe('LedgerPhantom.setComm', () => {
  it('should be a function', () => {
    expect(LedgerPhantom.setComm).toBeFunction()
  })
})

describe('LedgerPhantom.getPublicKey', () => {
  it('should be a function', () => {
    expect(LedgerPhantom.getPublicKey).toBeFunction()
  })
})

describe('LedgerPhantom.signTransaction', () => {
  it('should be a function', () => {
    expect(LedgerPhantom.signTransaction).toBeFunction()
  })
})

describe('LedgerPhantom.getAppConfiguration', () => {
  it('should be a function', () => {
    expect(LedgerPhantom.getAppConfiguration).toBeFunction()
  })
})
