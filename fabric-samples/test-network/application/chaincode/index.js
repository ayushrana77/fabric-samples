'use strict';



const { Contract } = require('fabric-contract-api');
const LandRecordContract = require('./landrecord');

module.exports.LandRecordContract = LandRecordContract;
module.exports.contracts = [LandRecordContract];
