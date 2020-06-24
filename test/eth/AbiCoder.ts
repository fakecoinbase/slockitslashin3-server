/*******************************************************************************
 * This file is part of the Incubed project.
 * Sources: https://github.com/slockit/in3-server
 * 
 * Copyright (C) 2018-2019 slock.it GmbH, Blockchains LLC
 * 
 * 
 * COMMERCIAL LICENSE USAGE
 * 
 * Licensees holding a valid commercial license may use this file in accordance 
 * with the commercial license agreement provided with the Software or, alternatively, 
 * in accordance with the terms contained in a written agreement between you and 
 * slock.it GmbH/Blockchains LLC. For licensing terms and conditions or further 
 * information please contact slock.it at in3@slock.it.
 * 	
 * Alternatively, this file may be used under the AGPL license as follows:
 *    
 * AGPL LICENSE USAGE
 * 
 * This program is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * [Permissions of this strong copyleft license are conditioned on making available 
 * complete source code of licensed works and modifications, which include larger 
 * works using a licensed work, under the same license. Copyright and license notices 
 * must be preserved. Contributors provide an express grant of patent rights.]
 * You should have received a copy of the GNU Affero General Public License along 
 * with this program. If not, see <https://www.gnu.org/licenses/>.
 *******************************************************************************/



import { assert } from 'chai'
import 'mocha'
import * as tx from '../../src/util/tx'
import * as clientRPC from '../utils/clientRPC'
import { util } from 'in3-common'
import { TestTransport, getTestClient, devPk } from '../utils/transport'
import { createPK } from '../../src/chains/signatures'
import { deployContract } from '../../src/util/registry'
import { resetSupport} from '../../src/modules/eth/proof'

const getAddress = util.getAddress

describe('AbiCoder', () => {
  beforeEach(resetSupport)

  it('encode', async () => {

    let enc = tx.encodeFunction('calculateBlockheaders(bytes[],bytes32):(bytes32)', [['0xf9020aa04a7cc454eedeb97110e7fb9655d22ad4275307bf2108437db91c7492a2b6ea63a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347942a65aca4d5fc5b5c859090a6c34d164135398226a051faf5dd23f27dce5afa8c434d98912885e76065dba7da32733e46447502ee9aa0a33b572475c4639480d3fdff48fb2a57c1edccaad17febf04b2bd9f3fff467a8a04d6ded18773430fb1d0f8655ba3bd2cdcfb6a81d04c58ebc92f14d9346f967f2b9010034f100ac144484e162484c04b08314a1004028410241005448019be000110400084101b001204f4581202510813404016540442035438980a603281004880080800030daad83004b9d0180deb214a880403c8d88003959002040816180016090053009088a0944e88a01028208062a00020903470820002603001150c405000884600040000a89622029120c6026b4401448b0c09400806640a9a97a216083101102ca064446042082640ba5044890800930042460c00c008c123c00400491860040905a511c64310592252210440a8104b06004800e0401240808040236a3c048800c06c80000c001a110080661a0c674a32026449001db00501249080a01048706aa8bf39e5d7a8370c84f837a12008379d6d7845c8f3b2f894477617266506f6f6ca0fa9312916254499d39910489dc3570721faff0bf087b99f6b62242a5b18986dc88e11d52e004660393'], '0x8761e59573bbb17578f5169a80afb37ccb832dc719ea51af233bfea8fb4e73da'])
    assert.equal(enc, "f351cd0a00000000000000000000000000000000000000000000000000000000000000408761e59573bbb17578f5169a80afb37ccb832dc719ea51af233bfea8fb4e73da00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000020df9020aa04a7cc454eedeb97110e7fb9655d22ad4275307bf2108437db91c7492a2b6ea63a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347942a65aca4d5fc5b5c859090a6c34d164135398226a051faf5dd23f27dce5afa8c434d98912885e76065dba7da32733e46447502ee9aa0a33b572475c4639480d3fdff48fb2a57c1edccaad17febf04b2bd9f3fff467a8a04d6ded18773430fb1d0f8655ba3bd2cdcfb6a81d04c58ebc92f14d9346f967f2b9010034f100ac144484e162484c04b08314a1004028410241005448019be000110400084101b001204f4581202510813404016540442035438980a603281004880080800030daad83004b9d0180deb214a880403c8d88003959002040816180016090053009088a0944e88a01028208062a00020903470820002603001150c405000884600040000a89622029120c6026b4401448b0c09400806640a9a97a216083101102ca064446042082640ba5044890800930042460c00c008c123c00400491860040905a511c64310592252210440a8104b06004800e0401240808040236a3c048800c06c80000c001a110080661a0c674a32026449001db00501249080a01048706aa8bf39e5d7a8370c84f837a12008379d6d7845c8f3b2f894477617266506f6f6ca0fa9312916254499d39910489dc3570721faff0bf087b99f6b62242a5b18986dc88e11d52e00466039300000000000000000000000000000000000000")

    enc = tx.encodeFunction('calculateBlockheaders(bytes[],bytes32):(bytes32)', [['0xf90212a08761e59573bbb17578f5169a80afb37ccb832dc719ea51af233bfea8fb4e73daa01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479452bc44d5378309ee2abf1539bf71de1b7d7be3b5a0986d10f9b609d8a9dbb5527c13fdbe932dffdb61618ed5aa92d59dc2927bb129a0d84e7014b5847470b2ba31edcaedeb40a21ff18015c8de81cd365c0de2f3e4caa0e0385ba71f981dab8d9998b855ee0955f610f5d7bf7f10e72e9a53f2282abd10b9010000020800410822a021400060a048000108ec98008102024404020200011088401dcb0000080140012018200200210025320000000c080006000c21000824b010800c09c0954320015080b0090403008446100000081d13100400000480400a04058001099e5304400a4d0c0d0818280104280a000025001012050812600000000707000000451100000304449234a01039402101a0c0004009090300001100010a8c2412401820010002158010119a400000047000000000000008000204014400004a120488804204a60008110b66020e040003089202000041201010607844a0102400440400882210102140118000082220080010414044181040000200448706ab61453cd1458370c850837a121d837754eb845c8f3b329150505945206e616e6f706f6f6c2e6f7267a0b1c29187877d81e485bb227eae8f9f97e79710d9cd2f0e1d00d4b9e6f72e327088273ebdb0182f979b', '0xf9020aa04a7cc454eedeb97110e7fb9655d22ad4275307bf2108437db91c7492a2b6ea63a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347942a65aca4d5fc5b5c859090a6c34d164135398226a051faf5dd23f27dce5afa8c434d98912885e76065dba7da32733e46447502ee9aa0a33b572475c4639480d3fdff48fb2a57c1edccaad17febf04b2bd9f3fff467a8a04d6ded18773430fb1d0f8655ba3bd2cdcfb6a81d04c58ebc92f14d9346f967f2b9010034f100ac144484e162484c04b08314a1004028410241005448019be000110400084101b001204f4581202510813404016540442035438980a603281004880080800030daad83004b9d0180deb214a880403c8d88003959002040816180016090053009088a0944e88a01028208062a00020903470820002603001150c405000884600040000a89622029120c6026b4401448b0c09400806640a9a97a216083101102ca064446042082640ba5044890800930042460c00c008c123c00400491860040905a511c64310592252210440a8104b06004800e0401240808040236a3c048800c06c80000c001a110080661a0c674a32026449001db00501249080a01048706aa8bf39e5d7a8370c84f837a12008379d6d7845c8f3b2f894477617266506f6f6ca0fa9312916254499d39910489dc3570721faff0bf087b99f6b62242a5b18986dc88e11d52e004660393'], '0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac20'])
    assert.equal(enc, 'f351cd0a00000000000000000000000000000000000000000000000000000000000000405b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002800000000000000000000000000000000000000000000000000000000000000215f90212a08761e59573bbb17578f5169a80afb37ccb832dc719ea51af233bfea8fb4e73daa01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479452bc44d5378309ee2abf1539bf71de1b7d7be3b5a0986d10f9b609d8a9dbb5527c13fdbe932dffdb61618ed5aa92d59dc2927bb129a0d84e7014b5847470b2ba31edcaedeb40a21ff18015c8de81cd365c0de2f3e4caa0e0385ba71f981dab8d9998b855ee0955f610f5d7bf7f10e72e9a53f2282abd10b9010000020800410822a021400060a048000108ec98008102024404020200011088401dcb0000080140012018200200210025320000000c080006000c21000824b010800c09c0954320015080b0090403008446100000081d13100400000480400a04058001099e5304400a4d0c0d0818280104280a000025001012050812600000000707000000451100000304449234a01039402101a0c0004009090300001100010a8c2412401820010002158010119a400000047000000000000008000204014400004a120488804204a60008110b66020e040003089202000041201010607844a0102400440400882210102140118000082220080010414044181040000200448706ab61453cd1458370c850837a121d837754eb845c8f3b329150505945206e616e6f706f6f6c2e6f7267a0b1c29187877d81e485bb227eae8f9f97e79710d9cd2f0e1d00d4b9e6f72e327088273ebdb0182f979b0000000000000000000000000000000000000000000000000000000000000000000000000000000000020df9020aa04a7cc454eedeb97110e7fb9655d22ad4275307bf2108437db91c7492a2b6ea63a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347942a65aca4d5fc5b5c859090a6c34d164135398226a051faf5dd23f27dce5afa8c434d98912885e76065dba7da32733e46447502ee9aa0a33b572475c4639480d3fdff48fb2a57c1edccaad17febf04b2bd9f3fff467a8a04d6ded18773430fb1d0f8655ba3bd2cdcfb6a81d04c58ebc92f14d9346f967f2b9010034f100ac144484e162484c04b08314a1004028410241005448019be000110400084101b001204f4581202510813404016540442035438980a603281004880080800030daad83004b9d0180deb214a880403c8d88003959002040816180016090053009088a0944e88a01028208062a00020903470820002603001150c405000884600040000a89622029120c6026b4401448b0c09400806640a9a97a216083101102ca064446042082640ba5044890800930042460c00c008c123c00400491860040905a511c64310592252210440a8104b06004800e0401240808040236a3c048800c06c80000c001a110080661a0c674a32026449001db00501249080a01048706aa8bf39e5d7a8370c84f837a12008379d6d7845c8f3b2f894477617266506f6f6ca0fa9312916254499d39910489dc3570721faff0bf087b99f6b62242a5b18986dc88e11d52e00466039300000000000000000000000000000000000000')

  })

  it('decode', async () => {
    let dec = tx.decodeFunction('calculateBlockheaders(bytes[],bytes32):(bytes[])', util.toBuffer('0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002abcd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002cdef000000000000000000000000000000000000000000000000000000000000'))
    assert.deepEqual(dec, [['0xabcd', '0xcdef']])

    dec = tx.decodeFunction('totalServers(uint):(uint)', util.toBuffer('0x0000000000000000000000000000000000000000000000000000000000000002'))
    assert.equal(dec[0].toNumber(), 2)

    const [url, owner, deposit, props, unregisterTime, unregisterDeposit, unregisterCaller] = tx.decodeFunction('servers(uint):(string,address,uint,uint,uint128,uint128,address)', util.toBuffer('0x00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000009ede820a9d092fceb803e91f5f1008ecc33e9a9d0000000000000000000000000000000000000000000000000000000000002710000000000000000000000000000000000000000000000000000000000000ffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022331000000000000000000000000000000000000000000000000000000000000'))

    assert.equal(url, '#1')
    assert.equal(owner, '0x9Ede820a9d092Fceb803e91f5F1008ecc33E9A9d')
    assert.equal(deposit.toNumber(), 10000)
    assert.equal(props.toNumber(), 65535)
    assert.equal(unregisterTime.toNumber(), 0)
    assert.equal(unregisterDeposit.toNumber(), 0)
    assert.equal(unregisterCaller, "0x0000000000000000000000000000000000000000")

    tx.decodeFunction('servers(uint):(string,address,uint,uint,uint,uint,address)', util.toBuffer('0x00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000009ede820a9d092fceb803e91f5f1008ecc33e9a9d0000000000000000000000000000000000000000000000000000000000002710000000000000000000000000000000000000000000000000000000000000ffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022331000000000000000000000000000000000000000000000000000000000000'))


  })



  it('callContract', async () => {

    let test = new TestTransport(1) // create a network of 3 nodes

    // check deployed code
    const adr = await deployContract('TestContract', createPK(devPk), getTestClient())
    await tx.callContract(test.url, adr, 'increase()', [], { privateKey: createPK(devPk), value: '0x0', confirm: true })

    const returnValue = await tx.callContract(test.url, adr, 'encodingTest(bytes[],bytes32):(bytes32,bytes[])', [['0xabcd', '0xcdef'], "0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac20"])

    assert.deepEqual(returnValue, ["0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac20", ['0xabcd', '0xcdef']])


  })

  it('callContractWithClient', async () => {
    let test = new TestTransport(1) // create a network of 3 nodes
    let client = await test.createClient({ proof: 'standard', requestCount: 1, includeCode: true })

    // check deployed code
    const adr = await deployContract('TestContract', createPK(devPk), getTestClient())

    // create a account with 500 wei
    const user = await test.createAccount(undefined, 500).then(_ => _.address)



    const returnValue = await clientRPC.callContractWithClient(client, adr, 'encodingTest(bytes[],bytes32):(bytes32,bytes[])', ['0xabcd', '0xcdef'], "0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac20")
    if (returnValue.error) throw new Error(returnValue.error)

    //  assert.deepEqual(returnValue.result, ["0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac20", ['0xabcd', '0xcdef']])
    assert.equal(returnValue.result, "0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac2000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002abcd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002cdef000000000000000000000000000000000000000000000000000000000000")

    assert.deepEqual(tx.decodeFunction('encodingTest(bytes[],bytes32):(bytes32,bytes[])', util.toBuffer("0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac2000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002abcd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002cdef000000000000000000000000000000000000000000000000000000000000")), ["0x5b465c871cd5dbb1949ae0a8a34a5c5ab1e72edbc2c0d1bedfb9234c4339ac20", ['0xabcd', '0xcdef']])
  })

})

