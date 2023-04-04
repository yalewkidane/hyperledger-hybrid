/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const CC = require('./lib/epcis_fully_on_chain_chaincode.js');

module.exports.CC = CC;
module.exports.contracts = [ CC ];
