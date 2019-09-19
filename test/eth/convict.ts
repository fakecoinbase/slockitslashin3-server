
/***********************************************************
* This file is part of the Slock.it IoT Layer.             *
* The Slock.it IoT Layer contains:                         *
*   - USN (Universal Sharing Network)                      *
*   - INCUBED (Trustless INcentivized remote Node Network) *
************************************************************
* Copyright (C) 2016 - 2018 Slock.it GmbH                  *
* All Rights Reserved.                                     *
************************************************************
* You may use, distribute and modify this code under the   *
* terms of the license contract you have concluded with    *
* Slock.it GmbH.                                           *
* For information about liability, maintenance etc. also   *
* refer to the contract concluded with Slock.it GmbH.      *
************************************************************
* For more information, please refer to https://slock.it   *
* For questions, please contact info@slock.it              *
***********************************************************/
const Sentry = require('@sentry/node');

import { assert } from 'chai'
import 'mocha'
import { util, BlockData, serialize } from 'in3-common'
import { Signature, RPCRequest, RPCResponse } from '../../src/types/types'
import * as tx from '../../src/util/tx'
import * as ethUtil from 'ethereumjs-util'
import { TestTransport, } from '../utils/transport'
import { toBN } from 'in3-common/js/src/util/util';
import { signatureCaches } from '../../src/chains/signatures'

const bytes32 = serialize.bytes32
const toNumber = util.toNumber
const toHex = util.toHex

if (process.env.SENTRY_ENABLE === 'true') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: process.env.SENTRY_RELEASE || "v0.0.0",
    environment: process.env.SENTRY_ENVIRONMENT || "local"
  });
}


const sign = (b: BlockData, registryId: string, pk: string, blockHash?: string) => {
  const msgHash = ethUtil.keccak(Buffer.concat([bytes32(blockHash || b.hash), bytes32(b.number), bytes32(registryId)]))
  const s = ethUtil.ecsign(msgHash, bytes32(pk))
  return {
    ...s,
    block: toNumber(b.number),
    blockHash: blockHash || b.hash,
    address: util.getAddress(pk),
    msgHash: toHex(msgHash, 32),
    r: toHex(s.r),
    s: toHex(s.s),
    v: s.v
  } as Signature
}

describe('Convict', () => {

  it('verify and convict (block within 256 blocks)', async () => {
    const test = await TestTransport.createWithRegisteredNodes(2)
    const watcher = test.getHandler(0).watcher
    const watcher2 = test.getHandler(1).watcher

    const pk1 = test.getHandlerConfig(0).privateKey

    const block = await test.getFromServer('eth_getBlockByNumber', 'latest', false) as BlockData
    const client = await test.createClient()

    // this is a correct signature and should not fail.
    const res = await client.sendRPC('eth_getBalance', [util.getAddress(pk1), 'latest'], undefined, {
      keepIn3: true, proof: 'standard', signatureCount: 1, requestCount: 1
    })

    assert.isDefined(res.in3.proof.signatures[0])
    test.injectRandom([0.01, 0.9])
    test.injectRandom([0.02, 0.8])

    let manipulated = false
    test.injectResponse({ method: 'in3_sign' }, (req: RPCRequest, re: RPCResponse, url: string) => {
      const index = parseInt(url.substr(1)) - 1
      // we change it to a wrong signature
      if (!manipulated) {
        re.result = [sign(block, test.registryId, test.getHandlerConfig(index).privateKey, pk1)]
        manipulated = true
      }
      return re
    })

    assert.equal(await test.getNodeCountFromContract(), 2)

    // we create a new client because the old one may have different weights now
    const client2 = await test.createClient()

    // just read all events
    await watcher.update()
    await watcher2.update()

    // this is a correct signature and should not fail.
    await client2.sendRPC('eth_getBalance', [util.getAddress(pk1), 'latest'], undefined, {
      keepIn3: true, proof: 'standard', signatureCount: 1, requestCount: 1
    })

    await test.createAccount()
    await test.createAccount()
    await test.createAccount()
    await watcher.update()
    await watcher2.update()

    // we should get a valid response even though server #0 signed a wrong hash and was convicted server #1 gave a correct one.
    assert.equal(await test.getNodeCountFromContract(), 1)

    // just read all events
    let events = await watcher.update()

    if (events.length == 0) events = await watcher2.update()
    assert.equal(events.length, 2)
    assert.equal(events.map(_ => _.event).join(), 'LogNodeConvicted,LogNodeRemoved')

  }).timeout(6000000)

  it("should increase the # of blocks to at least 260", async () => {

    const test = await TestTransport.createWithRegisteredNodes(2)

    let currentBlock = await test.getFromServer('eth_getBlockByNumber', "latest", false) as BlockData

    while (toNumber(currentBlock.number) < 260) {
      await test.createAccount(null, '1')
      currentBlock = await test.getFromServer('eth_getBlockByNumber', "latest", false) as BlockData

    }

  }).timeout(600000)

  it('verify and convict (block older then 256 blocks) - worth it', async () => {


    const test = await TestTransport.createWithRegisteredNodes(2)

    await tx.callContract(test.url, test.nodeList.contract, 'updateNode(address,string,uint64,uint64,uint64)', [util.getAddress(test.getHandlerConfig(0).privateKey), "#1", 0, 0, 0], { privateKey: test.getHandlerConfig(0).privateKey, value: toBN('490000000000000000'), confirm: true, gas: 5000000 })
    await tx.callContract(test.url, test.nodeList.contract, 'updateNode(address,string,uint64,uint64,uint64)', [util.getAddress(test.getHandlerConfig(1).privateKey), "#2", 0, 0, 0], { privateKey: test.getHandlerConfig(1).privateKey, value: toBN('490000000000000000'), confirm: true, gas: 5000000 }).catch(_ => false)

    const blockHashRegistry = (await tx.callContract(test.url, test.nodeList.contract, 'blockRegistry():(address)', []))[0].toString("hex")

    const txReceipt = (await tx.callContract(test.url, blockHashRegistry, 'snapshot()', [], { privateKey: test.getHandlerConfig(1).privateKey, value: 0, confirm: true, gas: 5000000 }))

    const wrongBlock = txReceipt.blockNumber - 0x104
    const watcher = test.getHandler(0).watcher

    const watcher2 = test.getHandler(1).watcher

    const pk1 = test.getHandlerConfig(0).privateKey
    const pk2 = test.getHandlerConfig(1).privateKey

    const block = await test.getFromServer('eth_getBlockByNumber', toHex(wrongBlock), false) as BlockData

    assert.equal((toNumber(txReceipt.blockNumber) - toNumber(block.number)), 260)

    const client = await test.createClient()

    // this is a correct signature and should not fail.
    const res = await client.sendRPC('eth_getBalance', [util.getAddress(pk1), toHex(wrongBlock)], undefined, {
      keepIn3: true, proof: 'standard', signatureCount: 1, requestCount: 1
    })

    assert.isDefined(res.in3.proof.signatures[0])
    test.injectRandom([0.01, 0.9])
    test.injectRandom([0.02, 0.8])

    let manipulated = false
    test.injectResponse({ method: 'in3_sign' }, (req: RPCRequest, re: RPCResponse, url: string) => {
      const index = parseInt(url.substr(1)) - 1
      // we change it to a wrong signature
      if (!manipulated) {
        re.result = [sign(block, test.registryId, test.getHandlerConfig(index).privateKey, pk1)]
        manipulated = true
      }
      return re
    })


    assert.equal(await test.getNodeCountFromContract(), 2)

    // we create a new client because the old one may have different weights now
    const client2 = await test.createClient()

    // just read all events
    await watcher.update()
    await watcher2.update()

    // this is a correct signature and should not fail.
    const res2 = await client2.sendRPC('eth_getBalance', [util.getAddress(pk1), toHex(wrongBlock)], undefined, {
      keepIn3: true, proof: 'standard', signatureCount: 1, requestCount: 1
    })

    // we should get a valid response even though server #0 signed a wrong hash and was convicted server #1 gave a correct one.
    await test.createAccount()
    // just read all events
    await watcher.update()
    await watcher2.update()

    await test.createAccount()
    let events = await watcher.update()

    if (!events) events = await watcher2.update()

    assert.equal(events.length, 2)
    assert.equal(await test.getNodeCountFromContract(), 1)

    assert.equal(events.map(_ => _.event).join(), 'LogNodeConvicted,LogNodeRemoved')

  }).timeout(6000000)


  it('verify and convict (block older then 256 blocks) - not worth it', async () => {
    const test = await TestTransport.createWithRegisteredNodes(2)

    const blockHashRegistry = (await tx.callContract(test.url, test.nodeList.contract, 'blockRegistry():(address)', []))[0].toString("hex")
    await tx.callContract(test.url, test.nodeList.contract, 'blockRegistry():(address)', [], { privateKey: test.getHandlerConfig(0).privateKey, to: test.nodeList.contract, value: 0, confirm: true, gas: 5000000 })

    const txReceipt = (await tx.callContract(test.url, blockHashRegistry, 'snapshot()', [], { privateKey: test.getHandlerConfig(1).privateKey, value: 0, confirm: true, gas: 5000000 }))

    const wrongBlock = txReceipt.blockNumber - 0x104

    console.log("address", test.nodeList.contract)
    console.log("privateKey", test.getHandlerConfig(0).privateKey)

    const watcher = test.getHandler(0).watcher
    const watcher2 = test.getHandler(1).watcher


    const pk1 = test.getHandlerConfig(0).privateKey
    const pk2 = test.getHandlerConfig(1).privateKey

    const block = await test.getFromServer('eth_getBlockByNumber', toHex(wrongBlock), false) as BlockData

    assert.equal((toNumber(txReceipt.blockNumber) - toNumber(block.number)), 260)

    const client = await test.createClient()

    // this is a correct signature and should not fail.
    const res = await client.sendRPC('eth_getBalance', [util.getAddress(pk1), toHex(wrongBlock)], undefined, {
      keepIn3: true, proof: 'standard', signatureCount: 1, requestCount: 1
    })

    assert.isDefined(res.in3.proof.signatures[0])
    test.injectRandom([0.01, 0.9])
    test.injectRandom([0.02, 0.8])
    signatureCaches.clear()
    let manipulated = false
    test.injectResponse({ method: 'in3_sign' }, (req: RPCRequest, re: RPCResponse, url: string) => {
      const index = parseInt(url.substr(1)) - 1
      // we change it to a wrong signature
      if (!manipulated) {
        re.result = [sign(block, test.registryId, test.getHandlerConfig(index).privateKey, pk1)]
        manipulated = true
      }
      return re
    })

    assert.equal(await test.getNodeCountFromContract(), 2)

    // we create a new client because the old one may have different weights now
    const client2 = await test.createClient()

    // just read all events
    await watcher.update()
    await watcher2.update()


    // this is a correct signature and should not fail.
    const res2 = await client2.sendRPC('eth_getBalance', [util.getAddress(pk1), toHex(wrongBlock)], undefined, {
      keepIn3: true, proof: 'standard', signatureCount: 1, requestCount: 1
    })

    // we should get a valid response even though server #0 signed a wrong hash and was convicted server #1 gave a correct one.
    await test.createClient()
    // just read all events
    let events = await watcher.update()
    let events2 = await watcher2.update()
    assert.equal(await test.getNodeCountFromContract(), 2)

    assert.equal(events, undefined)
    assert.equal(events2, undefined)


    // we should get a valid response even though server #0 signed a wrong hash and was convicted server #1 gave a correct one.
    await test.createClient()
    // just read all events
    events = await watcher.update()
    events2 = await watcher2.update()
    assert.equal(await test.getNodeCountFromContract(), 2)

    assert.equal(events, undefined)
    assert.equal(events2, undefined)


  })

})
