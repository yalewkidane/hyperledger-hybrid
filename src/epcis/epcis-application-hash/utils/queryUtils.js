//const events = require("../models/Events.js");
const responseObj = require("../models/response.js");
const queryPar = require("../config/queryConfig.js")
const responseUtil = require("../utils/responseUtils.js");
const checker = require("../utils/checkUtils.js");
const queryValidator = require("../validators/queryValidator")
const parmList = require("./queryParamList");

/*
const networkcontract = require("../networkContract")

let contract;
let gateway;

async function getContractandGateway() {
    [contract, gateway] = await networkcontract.connectToContract();
    //test_app(contract, gateway);
    //return [contract, gateway];
    //console.log("contract  ", contract)
}

getContractandGateway();
console.log("--------------------- ####: ")
*/
const { getContract } = require('../utils/networkContractUtil.js');

let contract;
let gateway;
async function evaluateContract() {
    [contract, gateway] = await getContract();
    // do something with contract and gateway
}
evaluateContract();

//const { connectToContract } = require('../networkContract.js');
//const [contract, gateway] = await connectToContract();
//const { contract, gateway } = require("./networkContractUtil");

//const masterDataModel = require("../models/MasterData");

//exports.builedQueryString = function builedQueryString(){};
//exports.builedQueryStringxx = function builedQueryString(parameters) {
exports.builedQueryString = async (parameters) => {
    const obj = {};
    //?PerPage -- Done
    //&GS1-EPCIS-Min
    //&GS1-EPCIS-Max 
    //&GS1-Extensions 
    //&NextPageToke -- Done
    /*
    if (typeof parameters.nextPageToken !== 'undefined') {
        const token = parameters.nextPageToken.replace('rel="next"', '');
        obj._id = { $lt: token }
        //obj._id=parameters.NextPageToken;
    }
    */
    //&GS1-CBV-Min -- Done
    //&GS1-CBV-Max -- Done
    //&GS1-EPCIS-Min -- Done
    //&GS1-EPCIS-Max -- Done
    //&GS1-EPC-Format -- Done
    //&GS1-CBV-XML-Format -- Done
    //&eventType -- Done
    if (typeof parameters.eventType !== 'undefined') {
        //console.log("parameters.eventType", parameters.eventType)
        //obj.type=parameters.eventType; 
        //const event = JSON.parse(parameters.eventType)
        //console.log(typeof JSON.parse(parameters.eventType), event);
        obj.type = { $in: parameters.eventType };
        //obj.type={$in:event};
    }
    //&GE_eventTime -- Done
    if (typeof parameters.GE_eventTime !== 'undefined') {
        obj.eventTime = { $gte: parameters.GE_eventTime };
    }
    //&LT_eventTime-- Done
    if (typeof parameters.LT_eventTime !== 'undefined') {
        obj.eventTime = { $lt: parameters.LT_eventTime };
    }
    //&GE_recordTime -- Done
    if (typeof parameters.GE_recordTime !== 'undefined') {
        obj.recordTime = { $gte: parameters.GE_recordTime };
    }
    //&LT_recordTime -- Done
    if (typeof parameters.LT_recordTime !== 'undefined') {
        obj.recordTime = { $lte: parameters.LT_recordTime };
    }
    //&EQ_action -- Done
    if (typeof parameters.EQ_action !== 'undefined') {
        obj.action = { $in: parameters.EQ_action };
    }

    //&EQ_bizStep -- Done
    if (typeof parameters.EQ_bizStep !== 'undefined') {
        obj.bizStep = { $in: parameters.EQ_bizStep };
    }
    //&EQ_disposition -- Done
    if (typeof parameters.EQ_disposition !== 'undefined') {
        //obj.disposition = parameters.EQ_disposition;
        obj.disposition = { $in: parameters.EQ_disposition };
    }
    //&EQ_persistentDisposition_set -- Done
    if (typeof parameters.EQ_persistentDisposition_set !== 'undefined') {
        //obj.persistentDisposition={ $exists: true };
        obj['persistentDisposition.set'] = parameters.EQ_persistentDisposition_set;
    }
    //&EQ_persistentDisposition_unset -- Done
    if (typeof parameters.EQ_persistentDisposition_unset !== 'undefined') {
        obj['persistentDisposition.unset'] = parameters.EQ_persistentDisposition_unset;
    }
    //&EQ_readPoint -- Done
    if (typeof parameters.EQ_readPoint !== 'undefined') {
        //obj['readPoint.id'] = parameters.EQ_readPoint;
        obj['readPoint.id'] = { $in: parameters.EQ_readPoint };
    }
    //&WD_readPoint --------------------------------------------- Not finished yet
    if (typeof parameters.WD_readPoint !== 'undefined') {
        var list = [];
        const Hierarchical = await getDescendant(masterDataModel, parameters.WD_readPoint, list);
        console.log("Hierarchical", Hierarchical)
        obj['readPoint.id'] = { $in: Hierarchical };
    }
    //&EQ_bizLocation
    if (typeof parameters.EQ_bizLocation !== 'undefined') {
        obj['bizLocation.id'] = { $in: parameters.EQ_bizLocation };
    }
    //&WD_bizLocation
    if (typeof parameters.WD_bizLocation !== 'undefined') {
        var list = [];
        const Hierarchical = await getDescendant(masterDataModel, parameters.WD_bizLocation, list);
        console.log("Hierarchical", Hierarchical)
        obj['bizLocation.id'] = { $in: Hierarchical };
    }
    //&EQ_transformationID 
    if (typeof parameters.EQ_transformationID !== 'undefined') {
        obj.transformationID = { $in: parameters.EQ_transformationID };
    }

    //&MATCH_epc
    if (typeof parameters.MATCH_epc !== 'undefined') {
        //obj.epcList = {$in: parameters.MATCH_epc}

        obj.$or = [
            { childEPCs: { $in: parameters.MATCH_epc } },
            { epcList: { $in: parameters.MATCH_epc } }
        ]

    }
    //&MATCH_parentID
    if (typeof parameters.MATCH_parentID !== 'undefined') {
        obj.parentID = { $in: parameters.MATCH_parentID };
    }
    //&MATCH_inputEPC
    if (typeof parameters.MATCH_inputEPC !== 'undefined') {
        obj.inputEPCList = { $in: parameters.MATCH_inputEPC };
    }
    //&MATCH_outputEPC
    if (typeof parameters.MATCH_outputEPC !== 'undefined') {
        obj.outputEPCList = { $in: parameters.MATCH_outputEPC };
    }
    //&MATCH_anyEPC
    if (typeof parameters.MATCH_anyEPC !== 'undefined') {
        obj.$or = [
            { childEPCs: { $in: parameters.MATCH_anyEPC } },
            { epcList: { $in: parameters.MATCH_anyEPC } },
            { parentID: { $in: parameters.MATCH_anyEPC } },
            { inputEPCList: { $in: parameters.MATCH_anyEPC } },
            { outputEPCList: { $in: parameters.MATCH_anyEPC } }
        ]

    }
    //&MATCH_epcClass
    if (typeof parameters.MATCH_epcClass !== 'undefined') {
        const regex = parameters.MATCH_epcClass.join("|");
        obj.$or = [
            { 'childQuantityList.epcClass': { $regex: regex, $options: "i" } },
            { 'quantityList.epcClass': { $regex: regex, $options: "i" } }
        ]

    }
    //&MATCH_inputEPCClass
    if (typeof parameters.MATCH_inputEPCClass !== 'undefined') {
        const regex = parameters.MATCH_inputEPCClass.join("|");
        obj['inputQuantityList.epcClass'] = { $regex: regex, $options: "i" }

    }
    //&MATCH_outputEPCClass
    if (typeof parameters.MATCH_outputEPCClass !== 'undefined') {
        const regex = parameters.MATCH_outputEPCClass.join("|");
        obj['outputQuantityList.epcClass'] = { $regex: regex, $options: "i" }

    }
    //&MATCH_anyEPCClass
    if (typeof parameters.MATCH_anyEPCClass !== 'undefined') {
        const regex = parameters.MATCH_anyEPCClass.join("|");
        obj.$or = [
            { 'childQuantityList.epcClass': { $regex: regex, $options: "i" } },
            { 'quantityList.epcClass': { $regex: regex, $options: "i" } },
            { 'inputQuantityList.epcClass': { $regex: regex, $options: "i" } },
            { 'outputQuantityList.epcClass': { $regex: regex, $options: "i" } }
        ]

    }
    //&EQ_quantity
    if (typeof parameters.EQ_quantity !== 'undefined') {
        obj.$or = [
            { 'quantityList.quantity': { $in: parameters.EQ_quantity } },
            { 'childQuantityList.quantity': { $in: parameters.EQ_quantity } },
            { 'outputQuantityList.quantity': { $in: parameters.EQ_quantity } },
            { 'inputQuantityList.quantity': { $in: parameters.EQ_quantity } }
        ]
    }

    //&GT_quantity
    if (typeof parameters.GT_quantity !== 'undefined') {
        obj.$or = [
            { 'quantityList.quantity': { $gt: parameters.GT_quantity } },
            { 'childQuantityList.quantity': { $gt: parameters.GT_quantity } },
            { 'outputQuantityList.quantity': { $gt: parameters.GT_quantity } },
            { 'inputQuantityList.quantity': { $gt: parameters.GT_quantity } }
        ]
    }
    //&GE_quantity
    if (typeof parameters.GE_quantity !== 'undefined') {
        obj.$or = [
            { 'quantityList.quantity': { $gte: parameters.GE_quantity } },
            { 'childQuantityList.quantity': { $gte: parameters.GE_quantity } },
            { 'outputQuantityList.quantity': { $gte: parameters.GE_quantity } },
            { 'inputQuantityList.quantity': { $gte: parameters.GE_quantity } }
        ]
    }
    //&LT_quantity
    if (typeof parameters.LT_quantity !== 'undefined') {
        obj.$or = [
            { 'quantityList.quantity': { $lt: parameters.LT_quantity } },
            { 'childQuantityList.quantity': { $lt: parameters.LT_quantity } },
            { 'outputQuantityList.quantity': { $lt: parameters.LT_quantity } },
            { 'inputQuantityList.quantity': { $lt: parameters.LT_quantity } }
        ]
    }
    //&LE_quantity
    if (typeof parameters.LE_quantity !== 'undefined') {
        obj.$or = [
            { 'quantityList.quantity': { $lte: parameters.LE_quantity } },
            { 'childQuantityList.quantity': { $lte: parameters.LE_quantity } },
            { 'outputQuantityList.quantity': { $lte: parameters.LE_quantity } },
            { 'inputQuantityList.quantity': { $lte: parameters.LE_quantity } }
        ]
    }
    //&EQ_eventID
    if (typeof parameters.EQ_eventID !== 'undefined') {
        obj.eventID = { $in: parameters.EQ_eventID };
    }

    //&GE_errorDeclarationTime
    if (typeof parameters.GE_errorDeclarationTime !== 'undefined') {
        obj['errorDeclaration.declarationTime'] = { $gte: parameters.GE_errorDeclarationTime };
    }

    //&LT_errorDeclarationTime
    if (typeof parameters.LT_errorDeclarationTime !== 'undefined') {
        obj['errorDeclaration.declarationTime'] = { $lte: parameters.LT_errorDeclarationTime };
    }
    //&EQ_errorReason
    if (typeof parameters.EQ_errorReason !== 'undefined') {
        obj['errorDeclaration.reason'] = { $in: parameters.EQ_errorReason };
    }
    //&EQ_correctiveEventID
    if (typeof parameters.EQ_correctiveEventID !== 'undefined') {
        obj['errorDeclaration.correctiveEventIDs'] = { $in: parameters.EQ_correctiveEventID };
    }

    //&orderBy Check parent method
    //&orderDirection Check parent method
    //&eventCountLimit Check parent method
    //&maxEventCount Check parent method


    //&GE_startTime
    if (typeof parameters.GE_startTime !== 'undefined') {
        obj['sensorElementList.sensorMetadata.startTime'] = { $gte: parameters.GE_startTime };
    }
    //&LT_startTime
    if (typeof parameters.LT_startTime !== 'undefined') {
        obj['sensorElementList.sensorMetadata.startTime'] = { $lt: parameters.LT_startTime };
    }
    //&GE_endTime
    if (typeof parameters.GE_endTime !== 'undefined') {
        obj['sensorElementList.sensorMetadata.endTime'] = { $gte: parameters.GE_endTime };
    }
    //&LT_endTime
    if (typeof parameters.LT_endTime !== 'undefined') {
        obj['sensorElementList.sensorMetadata.endTime'] = { $lt: parameters.LT_endTime };
    }
    //&EQ_type
    if (typeof parameters.EQ_type !== 'undefined') {
        obj['sensorElementList.sensorReport.type'] = { $in: parameters.EQ_type };
    }
    //&EQ_deviceID
    if (typeof parameters.EQ_deviceID !== 'undefined') {
        obj['sensorElementList.sensorMetadata.deviceID'] = { $in: parameters.EQ_deviceID };
    }
    //&EQ_dataProcessingMethod
    if (typeof parameters.EQ_dataProcessingMethod !== 'undefined') {
        obj['sensorElementList.sensorMetadata.dataProcessingMethod'] = { $in: parameters.EQ_dataProcessingMethod };
    }
    //&EQ_microorganism
    if (typeof parameters.EQ_microorganism !== 'undefined') {
        obj['sensorElementList.sensorReport.microorganism'] = { $in: parameters.EQ_microorganism };
    }
    //&EQ_chemicalSubstance
    if (typeof parameters.EQ_chemicalSubstance !== 'undefined') {
        obj['sensorElementList.sensorReport.chemicalSubstance'] = { $in: parameters.EQ_chemicalSubstance };
    }
    //&EQ_bizRules
    if (typeof parameters.EQ_bizRules !== 'undefined') {
        obj['sensorElementList.sensorMetadata.bizRules'] = { $in: parameters.EQ_bizRules };
    }
    //&EQ_stringValue
    if (typeof parameters.EQ_stringValue !== 'undefined') {
        obj['sensorElementList.sensorReport.stringValue'] = { $in: parameters.EQ_stringValue };
    }
    //&EQ_hexBinaryValue
    if (typeof parameters.EQ_hexBinaryValue !== 'undefined') {
        obj['sensorElementList.sensorReport.hexBinaryValue'] = { $in: parameters.EQ_hexBinaryValue };
    }
    //&EQ_uriValue
    if (typeof parameters.EQ_uriValue !== 'undefined') {
        obj['sensorElementList.sensorReport.uriValue'] = { $in: parameters.EQ_uriValue };
    }
    //&EQ_booleanValue
    if (typeof parameters.EQ_booleanValue !== 'undefined') {
        obj['sensorElementList.sensorReport.booleanValue'] = parameters.EQ_booleanValue;
    }
    //&GE_percRank
    if (typeof parameters.GE_percRank !== 'undefined') {
        obj['sensorElementList.sensorReport.percValue'] = { $gte: parameters.GE_percRank };
    }
    //&LT_percRank
    if (typeof parameters.LT_percRank !== 'undefined') {
        obj['sensorElementList.sensorReport.percValue'] = { $lt: parameters.LT_percRank };
    }

    if (typeof parameters['oliot:epc'] !== 'undefined') {
        console.log("parameters['oliot:epc'] ", parameters['oliot:epc'])
        {
            obj.$or = [
                { parentID: parameters['oliot:epc'] },
                { childEPCs: parameters['oliot:epc'] },
                { epcList: parameters['oliot:epc'] },
                { inputEPCList: parameters['oliot:epc'] },
                { outputEPCList: parameters['oliot:epc'] }
            ]
        }
    };
    //HASATTR_



    Object.keys(parameters).forEach(function (key) {
        if (key.startsWith("EQ_bizTransaction_")) {
            const newkeyVla = key.replace("EQ_bizTransaction_", "");
            obj.$and = [
                { "bizTransactionList.type": newkeyVla },
                { "bizTransactionList.bizTransaction": { $in: parameters[key] } }
            ]
            return;
        }
        if (key.startsWith("EQ_source_")) {
            const newkeyVla = key.replace("EQ_source_", "");
            obj.$and = [
                { "sourceList.type": newkeyVla },
                { "sourceList.source": { $in: parameters[key] } }
            ]
            return;
        }
        if (key.startsWith("EQ_destination_")) {
            const newkeyVla = key.replace("EQ_destination_", "");
            obj.$and = [
                { "destinationList.type": newkeyVla },
                { "destinationList.destination": { $in: parameters[key] } }
            ]
            return;
        }
        if (key.startsWith("EQ_readPoint_")) {
            const newkeyVla = key.replace("EQ_readPoint_", "");
            if (typeof parameters[key] == 'object') {
                obj['readPoint.' + newkeyVla] = { $in: parameters[key] };
            } else {
                obj['readPoint.' + newkeyVla] = parameters[key];
            }
            return;
        }
        if (key.startsWith("EQ_INNER_readPoint_")) {
            console.log("typeof parameters[key]: ", typeof parameters[key]);
            const newkeyVla = key.replace("EQ_INNER_readPoint_", "");
            var inner_ker = "readPoint";
            newkeyVla.split("_").forEach(element => inner_ker = inner_ker + "." + element)

            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("EQ_bizLocation_")) {
            const newkeyVla = key.replace("EQ_bizLocation_", "");
            if (typeof parameters[key] == 'object') {
                obj['bizLocation.' + newkeyVla] = { $in: parameters[key] };
            } else {
                obj['bizLocation.' + newkeyVla] = parameters[key];
            }
            return;
        }
        if (key.startsWith("EQ_INNER_bizLocation_")) {
            //console.log("typeof parameters[key]: ", typeof parameters[key]);
            const newkeyVla = key.replace("EQ_INNER_bizLocation_", "");
            var inner_ker = "bizLocation";
            newkeyVla.split("_").forEach(element => inner_ker = inner_ker + "." + element)

            if (isValidDateFormat(parameters[key]))
            //{obj[inner_ker]= {"$lt": new Date( parameters[key] )};}
            { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("EQ_quantity_")) {
            const uomVal = key.replace("EQ_quantity_", "");
            //console.log("uomVal :", uomVal)
            obj.$or = [
                { 'quantityList': { $elemMatch: { "quantity": { $in: parameters[key] }, "uom": { $exists: true } } } },
                { 'childQuantityList': { $elemMatch: { "quantity": { $in: parameters[key] }, "uom": { $exists: true } } } },
                { 'quantoutputQuantityListityList': { $elemMatch: { "quantity": { $in: parameters[key] }, "uom": { $exists: true } } } },
                { 'inputQuantityList': { $elemMatch: { "quantity": { $in: parameters[key] }, "uom": { $exists: true } } } }
            ]
            return;
        }
        if (key.startsWith("GE_quantity_")) {
            const uomVal = key.replace("GE_quantity_", "");
            //console.log("uomVal :", uomVal)
            obj.$or = [
                { 'quantityList': { $elemMatch: { "quantity": { $gte: parameters[key] }, "uom": { $exists: true } } } },
                { 'childQuantityList': { $elemMatch: { "quantity": { $gte: parameters[key] }, "uom": { $exists: true } } } },
                { 'quantoutputQuantityListityList': { $elemMatch: { "quantity": { $gte: parameters[key] }, "uom": { $exists: true } } } },
                { 'inputQuantityList': { $elemMatch: { "quantity": { $gte: parameters[key] }, "uom": { $exists: true } } } }
            ]
            return;
        }
        if (key.startsWith("GT_quantity_")) {
            const uomVal = key.replace("GT_quantity_", "");
            //console.log("uomVal :", uomVal)
            obj.$or = [
                { 'quantityList': { $elemMatch: { "quantity": { $gt: parameters[key] }, "uom": { $exists: true } } } },
                { 'childQuantityList': { $elemMatch: { "quantity": { $gt: parameters[key] }, "uom": { $exists: true } } } },
                { 'quantoutputQuantityListityList': { $elemMatch: { "quantity": { $gt: parameters[key] }, "uom": { $exists: true } } } },
                { 'inputQuantityList': { $elemMatch: { "quantity": { $gt: parameters[key] }, "uom": { $exists: true } } } }
            ]
            return;
        }
        if (key.startsWith("LT_quantity_")) {
            const uomVal = key.replace("LT_quantity_", "");
            //console.log("uomVal :", uomVal)
            obj.$or = [
                { 'quantityList': { $elemMatch: { "quantity": { $lt: parameters[key] }, "uom": { $exists: true } } } },
                { 'childQuantityList': { $elemMatch: { "quantity": { $lt: parameters[key] }, "uom": { $exists: true } } } },
                { 'quantoutputQuantityListityList': { $elemMatch: { "quantity": { $lt: parameters[key] }, "uom": { $exists: true } } } },
                { 'inputQuantityList': { $elemMatch: { "quantity": { $lt: parameters[key] }, "uom": { $exists: true } } } }
            ]
            return;
        }
        if (key.startsWith("LE_quantity_")) {
            const uomVal = key.replace("LE_quantity_", "");
            //console.log("uomVal :", uomVal)
            obj.$or = [
                { 'quantityList': { $elemMatch: { "quantity": { $lte: parameters[key] }, "uom": { $exists: true } } } },
                { 'childQuantityList': { $elemMatch: { "quantity": { $lte: parameters[key] }, "uom": { $exists: true } } } },
                { 'quantoutputQuantityListityList': { $elemMatch: { "quantity": { $lte: parameters[key] }, "uom": { $exists: true } } } },
                { 'inputQuantityList': { $elemMatch: { "quantity": { $lte: parameters[key] }, "uom": { $exists: true } } } }
            ]
            return;
        }
        //ILMD
        if (key.startsWith("EQ_ILMD_")) {
            const newkeyVla = key.replace("EQ_ILMD_", "");

            if (isValidDateFormat(parameters[key])) { obj['ilmd.' + newkeyVla] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj['ilmd.' + newkeyVla] = { $in: parameters[key] }; }
            else { obj['ilmd.' + newkeyVla] = parameters[key]; }
            return;
        }
        if (key.startsWith("GT_ILMD_")) {
            const newkeyVla = key.replace("GT_ILMD_", "");
            obj['ilmd.' + newkeyVla] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_ILMD_")) {
            const newkeyVla = key.replace("GE_ILMD_", "");
            obj['ilmd.' + newkeyVla] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_ILMD_")) {
            const newkeyVla = key.replace("LT_ILMD_", "");
            obj['ilmd.' + newkeyVla] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_ILMD_")) {
            const newkeyVla = key.replace("LE_ILMD_", "");
            obj['ilmd.' + newkeyVla] = { $lte: parameters[key] };
            return;
        }
        //_INNER_ILMD_
        if (key.startsWith("EQ_INNER_ILMD_")) {
            const newkeyVla = key.replace("EQ_INNER_ILMD_", "");
            var inner_ker = 'ilmd.' + newkeyVla.replaceAll("_", ".");
            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("GT_INNER_ILMD_")) {
            const newkeyVla = key.replace("GT_INNER_ILMD_", "");
            var inner_ker = 'ilmd.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_INNER_ILMD_")) {
            const newkeyVla = key.replace("GE_INNER_ILMD_", "");
            var inner_ker = 'ilmd.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_INNER_ILMD_")) {
            const newkeyVla = key.replace("LT_INNER_ILMD_", "");
            var inner_ker = 'ilmd.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_INNER_ILMD_")) {
            const newkeyVla = key.replace("LE_INNER_ILMD_", "");
            var inner_ker = 'ilmd.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lte: parameters[key] };
            return;
        }
        //EQ_ERROR_DECLARATION_
        if (key.startsWith("EQ_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("EQ_ERROR_DECLARATION_", "");

            if (isValidDateFormat(parameters[key])) { obj['errorDeclaration.' + newkeyVla] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj['errorDeclaration.' + newkeyVla] = { $in: parameters[key] }; }
            else { obj['errorDeclaration.' + newkeyVla] = parameters[key]; }
            return;
        }
        if (key.startsWith("GT_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("GT_ERROR_DECLARATION_", "");
            obj['errorDeclaration.' + newkeyVla] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("GE_ERROR_DECLARATION_", "");
            obj['errorDeclaration.' + newkeyVla] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("LT_ERROR_DECLARATION_", "");
            obj['errorDeclaration.' + newkeyVla] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("LE_ERROR_DECLARATION_", "");
            obj['errorDeclaration.' + newkeyVla] = { $lte: parameters[key] };
            return;
        }
        //_INNER_ERROR_DECLARATION_
        if (key.startsWith("EQ_INNER_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("EQ_INNER_ERROR_DECLARATION_", "");
            var inner_ker = 'errorDeclaration.' + newkeyVla.replaceAll("_", ".");
            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("GT_INNER_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("GT_INNER_ERROR_DECLARATION_", "");
            var inner_ker = 'errorDeclaration.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_INNER_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("GE_INNER_ERROR_DECLARATION_", "");
            var inner_ker = 'errorDeclaration.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_INNER_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("LT_INNER_ERROR_DECLARATION_", "");
            var inner_ker = 'errorDeclaration.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_INNER_ERROR_DECLARATION_")) {
            const newkeyVla = key.replace("LE_INNER_ERROR_DECLARATION_", "");
            var inner_ker = 'errorDeclaration.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lte: parameters[key] };
            return;
        }
        //EQ_SENSORELEMENT_
        if (key.startsWith("EQ_SENSORELEMENT_")) {
            const newkeyVla = key.replace("EQ_SENSORELEMENT_", "");

            if (isValidDateFormat(parameters[key])) { obj['sensorElementList.' + newkeyVla] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj['sensorElementList.' + newkeyVla] = { $in: parameters[key] }; }
            else { obj['sensorElementList.' + newkeyVla] = parameters[key]; }
            return;
        }
        if (key.startsWith("GT_SENSORELEMENT_")) {
            const newkeyVla = key.replace("GT_SENSORELEMENT_", "");
            obj['sensorElementList.' + newkeyVla] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_SENSORELEMENT_")) {
            const newkeyVla = key.replace("GE_SENSORELEMENT_", "");
            obj['sensorElementList.' + newkeyVla] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_SENSORELEMENT_")) {
            const newkeyVla = key.replace("LT_SENSORELEMENT_", "");
            obj['sensorElementList.' + newkeyVla] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_SENSORELEMENT_")) {
            const newkeyVla = key.replace("LE_SENSORELEMENT_", "");
            obj['sensorElementList.' + newkeyVla] = { $lte: parameters[key] };
            return;
        }
        //EQ_INNER_SENSORELEMENT_
        if (key.startsWith("EQ_INNER_SENSORELEMENT_")) {
            const newkeyVla = key.replace("EQ_INNER_SENSORELEMENT_", "");
            var inner_ker = 'sensorElementList.' + newkeyVla.replaceAll("_", ".");
            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("GT_INNER_SENSORELEMENT_")) {
            const newkeyVla = key.replace("GT_INNER_SENSORELEMENT_", "");
            var inner_ker = 'sensorElementList.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_INNER_SENSORELEMENT_")) {
            const newkeyVla = key.replace("GE_INNER_SENSORELEMENT_", "");
            var inner_ker = 'sensorElementList.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_INNER_SENSORELEMENT_")) {
            const newkeyVla = key.replace("LT_INNER_SENSORELEMENT_", "");
            var inner_ker = 'sensorElementList.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_INNER_SENSORELEMENT_")) {
            const newkeyVla = key.replace("LE_INNER_SENSORELEMENT_", "");
            var inner_ker = 'sensorElementList.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lte: parameters[key] };
            return;
        }
        //EQ_SENSORMETADATA_
        if (key.startsWith("EQ_SENSORMETADATA_")) {
            const newkeyVla = key.replace("EQ_SENSORMETADATA_", "");
            if (isValidDateFormat(parameters[key])) {
                obj['sensorElementList.sensorMetadata.' + newkeyVla] = { "$eq": parameters[key] };
            }
            else if (typeof parameters[key] == 'object') {
                obj['sensorElementList.sensorMetadata.' + newkeyVla] = { $in: parameters[key] };
            }
            else { obj['sensorElementList.sensorMetadata.' + newkeyVla] = parameters[key]; }
            return;
        }
        if (key.startsWith("GT_SENSORMETADATA_")) {
            const newkeyVla = key.replace("GT_SENSORMETADATA_", "");
            obj['sensorElementList.sensorMetadata.' + newkeyVla] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_SENSORMETADATA_")) {
            const newkeyVla = key.replace("GE_SENSORMETADATA_", "");
            obj['sensorElementList.sensorMetadata.' + newkeyVla] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_SENSORMETADATA_")) {
            const newkeyVla = key.replace("LT_SENSORMETADATA_", "");
            obj['sensorElementList.sensorMetadata.' + newkeyVla] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_SENSORMETADATA_")) {
            const newkeyVla = key.replace("LE_SENSORMETADATA_", "");
            obj['sensorElementList.sensorMetadata.' + newkeyVla] = { $lte: parameters[key] };
            return;
        }

        //EQ_INNER_SENSORMETADATA_
        if (key.startsWith("EQ_INNER_SENSORMETADATA_")) {
            const newkeyVla = key.replace("EQ_INNER_SENSORMETADATA_", "");
            var inner_ker = 'sensorElementList.sensorMetadata.' + newkeyVla.replaceAll("_", ".");
            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("GT_INNER_SENSORMETADATA_")) {
            const newkeyVla = key.replace("GT_INNER_SENSORMETADATA_", "");
            var inner_ker = 'sensorElementList.sensorMetadata.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_INNER_SENSORMETADATA_")) {
            const newkeyVla = key.replace("GE_INNER_SENSORMETADATA_", "");
            var inner_ker = 'sensorElementList.sensorMetadata.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_INNER_SENSORMETADATA_")) {
            const newkeyVla = key.replace("LT_INNER_SENSORMETADATA_", "");
            var inner_ker = 'sensorElementList.sensorMetadata.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_INNER_SENSORMETADATA_")) {
            const newkeyVla = key.replace("LE_INNER_SENSORMETADATA_", "");
            var inner_ker = 'sensorElementList.sensorMetadata.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lte: parameters[key] };
            return;
        }


        //EQ_SENSORREPORT_
        if (key.startsWith("EQ_SENSORREPORT_")) {
            const newkeyVla = key.replace("EQ_SENSORREPORT_", "");

            if (isValidDateFormat(parameters[key])) { obj['sensorElementList.sensorReport.' + newkeyVla] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj['sensorElementList.sensorReport.' + newkeyVla] = { $in: parameters[key] }; }
            else { obj['sensorElementList.sensorReport.' + newkeyVla] = parameters[key]; }
            return;
        }
        if (key.startsWith("GT_SENSORREPORT_")) {
            const newkeyVla = key.replace("GT_SENSORREPORT_", "");
            obj['sensorElementList.sensorReport.' + newkeyVla] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_SENSORREPORT_")) {
            const newkeyVla = key.replace("GE_SENSORREPORT_", "");
            obj['sensorElementList.sensorReport.' + newkeyVla] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_SENSORREPORT_")) {
            const newkeyVla = key.replace("LT_SENSORREPORT_", "");
            obj['sensorElementList.sensorReport.' + newkeyVla] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_SENSORREPORT_")) {
            const newkeyVla = key.replace("LE_SENSORREPORT_", "");
            obj['sensorElementList.sensorReport.' + newkeyVla] = { $lte: parameters[key] };
            return;
        }


        //EQ_INNER_SENSOREPORT_
        if (key.startsWith("EQ_INNER_SENSORREPORT_")) {
            const newkeyVla = key.replace("EQ_INNER_SENSORREPORT_", "");
            var inner_ker = 'sensorElementList.sensorReport.' + newkeyVla.replaceAll("_", ".");
            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("GT_INNER_SENSORREPORT_")) {
            const newkeyVla = key.replace("GT_INNER_SENSORREPORT_", "");
            var inner_ker = 'sensorElementList.sensorReport.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_INNER_SENSORREPORT_")) {
            const newkeyVla = key.replace("GE_INNER_SENSORREPORT_", "");
            var inner_ker = 'sensorElementList.sensorReport.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_INNER_SENSORREPORT_")) {
            const newkeyVla = key.replace("LT_INNER_SENSORREPORT_", "");
            var inner_ker = 'sensorElementList.sensorReport.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_INNER_SENSORREPORT_")) {
            const newkeyVla = key.replace("LE_INNER_SENSORREPORT_", "");
            var inner_ker = 'sensorElementList.sensorReport.' + newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lte: parameters[key] };
            return;
        }

        //EQ_value_uom
        if (key.startsWith("EQ_value_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "value": { $in: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GT_value_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "value": { $gt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GE_value_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "value": { $gte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LT_value_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "value": { $lt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LE_value_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "value": { $lte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GT_minValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "minValue": { $gt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GE_minValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "minValue": { $gte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LT_minValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "minValue": { $lt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LE_minValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "minValue": { $lte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GE_maxValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "maxValue": { $gte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LT_maxValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "maxValue": { $lt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GT_meanValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "meanValue": { $gt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GE_meanValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "meanValue": { $gte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LT_meanValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "meanValue": { $lt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LE_meanValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "meanValue": { $lte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GT_sDev_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "sDev": { $gt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GE_sDev_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "sDev": { $gte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LT_sDev_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "sDev": { $lt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LE_sDev_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "sDev": { $lte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        //percValue
        if (key.startsWith("GT_percValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "percValue": { $gt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("GE_percValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "percValue": { $gte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LT_percValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "percValue": { $lt: parameters[key] }, "uom": { $exists: true } } }
            return;
        }
        if (key.startsWith("LE_percValue_")) {
            obj['sensorElementList.sensorReport'] = { $elemMatch: { "percValue": { $lte: parameters[key] }, "uom": { $exists: true } } }
            return;
        }

        //EXISTS_
        if (key.startsWith("EXISTS_")) {

            if (key == "EXISTS_errorDeclaration") {
                obj.errorDeclaration = { $exists: parameters.EXISTS_errorDeclaration };
            }
            else if (key.startsWith("EXISTS_ERROR_DECLARATION_")) {
                const newkeyVla = key.replace("EXISTS_ERROR_DECLARATION_", "");
                obj['errorDeclaration.' + newkeyVla] = { $exists: true };
            }
            else if (key.startsWith("EXISTS_INNER_ERROR_DECLARATION_")) {
                const newkeyVla = key.replace("EXISTS_INNER_ERROR_DECLARATION_", "");
                var inner_ker = 'errorDeclaration.' + newkeyVla.replaceAll("_", ".");
                obj[inner_ker] = { $exists: true };
            }
            else if (key.startsWith("EXISTS_INNER_ILMD_")) {
                const newkeyVla = key.replace("EXISTS_INNER_ILMD_", "");
                var inner_ker = 'ilmd.' + newkeyVla.replaceAll("_", ".");
                obj[inner_ker] = { $exists: true };
            } else if (key.startsWith("EXISTS_ILMD_")) {
                const newkeyVla = key.replace("EXISTS_ILMD_", "");
                obj['ilmd.' + newkeyVla] = { $exists: true };
            } else if (key.startsWith("EXISTS_INNER_")) {
                const newkeyVla = key.replace("EXISTS_INNER_", "");
                var inner_ker = newkeyVla.replaceAll("_", ".");
                obj[inner_ker] = { $exists: true };
            } else if (key.startsWith("EXISTS_SENSORELEMENT_")) {
                const newkeyVla = key.replace("EXISTS_SENSORELEMENT_", "");
                obj['sensorElementList.' + newkeyVla] = { $exists: true };
            } else if (key.startsWith("EXISTS_SENSORMETADATA_")) {
                const newkeyVla = key.replace("EXISTS_SENSORMETADATA_", "");
                obj['sensorElementList.sensorMetadata.' + newkeyVla] = { $exists: true };
            } else if (key.startsWith("EXISTS_SENSORREPORT_")) {
                const newkeyVla = key.replace("EXISTS_SENSORREPORT_", "");
                obj['sensorElementList.sensorReport.' + newkeyVla] = { $exists: true };
            } else {
                const newkeyVla = key.replace("EXISTS_", "");
                obj[newkeyVla] = { $exists: true };
            }
            return;
        }
        //_INNER_
        if (key.startsWith("EQ_INNER_")) {
            const newkeyVla = key.replace("EQ_INNER_", "");
            var inner_ker = newkeyVla.replaceAll("_", ".");
            //newkeyVla.split("_").forEach(element => inner_ker = inner_ker + "." + element)
            if (isValidDateFormat(parameters[key])) { obj[inner_ker] = { "$eq": parameters[key] }; }
            else if (typeof parameters[key] == 'object') { obj[inner_ker] = { $in: parameters[key] }; }
            else { obj[inner_ker] = parameters[key]; }
            return;

        }
        if (key.startsWith("GT_INNER_")) {
            const newkeyVla = key.replace("GT_INNER_", "");
            var inner_ker = newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gt: parameters[key] };
            return;
        }
        if (key.startsWith("GE_INNER_")) {
            const newkeyVla = key.replace("GE_INNER_", "");
            var inner_ker = newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $gte: parameters[key] };
            return;
        }
        if (key.startsWith("LT_INNER_")) {
            const newkeyVla = key.replace("LT_INNER_", "");
            var inner_ker = newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lt: parameters[key] };
            return;
        }
        if (key.startsWith("LE_INNER_")) {
            const newkeyVla = key.replace("LE_INNER_", "");
            var inner_ker = newkeyVla.replaceAll("_", ".");
            obj[inner_ker] = { $lte: parameters[key] };
            return;
        }
        else if (!parmList.standardQuery.includes(key)) {
            if (key.startsWith("EQ_")) {
                const newKey = key.replace('EQ_', '')
                if (isValidDateFormat(parameters[key])) { obj[newKey] = { "$eq": parameters[key] }; }
                else if (typeof parameters[key] == 'object') { obj[newKey] = { $in: parameters[key] }; }
                else { obj[newKey] = parameters[key]; }
                /*
                if (typeof parameters[key].length !== 'undefined') {
                    obj[newKey] = { $in: parameters[key] };
                } else {
                    //obj[newKey] = { $eq: parameters[key] } ;
                    obj[newKey] = parameters[key];
                }*/
            } else if (key.startsWith("GT_")) {
                const newKey = key.replace('GT_', '')
                obj[newKey] = { $gt: parameters[key] };
            } else if (key.startsWith("GE_")) {
                const newKey = key.replace('GE_', '')
                obj[newKey] = { $gte: parameters[key] };
            } else if (key.startsWith("LT_")) {
                const newKey = key.replace('LT_', '')
                obj[newKey] = { $lt: parameters[key] };
            } else if (key.startsWith("LE_")) {
                const newKey = key.replace('LE_', '')
                obj[newKey] = { $lte: parameters[key] };
            }
        }
    });

    return obj;
}


async function getDescendant(model, WD_Arr, list) {

    for (let i = 0; i < WD_Arr.length; i++) {
        const element = WD_Arr[i];
        list.push(element);
        const readPoints = await model.find({ id: element });
        if (readPoints) {
            if (readPoints.length > 0) {
                for (let j = 0; j < readPoints.length; j++) {
                    const parent = readPoints[j]
                    if (typeof parent.children !== 'undefined') {
                        if (parent.children.length > 0) {
                            await getDescendant(model, parent.children, list)
                        }
                    }
                }
            }
        }
    }
    return list;
}

function contextAdder(GContext, conkey, conval, index) {
    if (GContext.length == index) {
        const tempCont = {}; tempCont[conkey] = conval;
        GContext.push(tempCont);
        return;
    }
    else if (typeof GContext[index][conkey] !== "undefined") {
        if (GContext[index][conkey] !== conval) {
            contextAdder(GContext, conkey, conval, index + 1);
        }
    } else {
        GContext[index][conkey] = conval;
        return;
    }
}

exports.getQueryResult = async (req, res) => {
    try {
        //check Headers
        const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
        if (!queryCheck) {
            return responseUtil.response406(res, queryCheckError);
        }
        //convert to Json
        //console.log("here -34", req.headers);


        const notToBeParsed = ["orderBy", "nextPageToken", "GE_eventTime", "LT_eventTime", "GE_recordTime", "WD_readPoint", "LT_recordTime",
            "orderDirection"]

        var Key_val = ""
        //var vocabulary={};

        try {
            Object.keys(req.query).forEach(function (key) {
                if (key.startsWith("EXISTS_")) { req.query[key] = 1; }
                if (!notToBeParsed.includes(key)) {
                    Key_val = key;
                    var val = req.query[key];
                    //console.log(key, val);
                    //console.log("typeof", typeof val);
                    const validData = isValidDateFormat(req.query[key]);
                    //console.log("validData", validData);
                    if (!validData) {
                        req.query[key] = JSON.parse(req.query[key])
                    }
                }
            });
        } catch (error) {
            console.log(error)
            return responseUtil.response400(res, "[" + Key_val + "] " + String(error));
        }


        // Validate query String
        //const [valStatus, valEror] = queryValidator.queryValidate(JSON.stringify(req.query));
        const [valStatus, valEror] = queryValidator.queryValidate(req.query);
        if (!valStatus) {
            return responseUtil.response400(res, valEror);
        }
        //Building query string
        var eventLimit = queryPar.maxEvent;
        if (typeof req.query.perPage !== 'undefined') {
            if (0 < req.query.perPage && req.query.perPage <= queryPar.maxEvent) {
                //console.log("perpage: ", req.query.PerPage)
                eventLimit = req.query.perPage;
            }
        }
        if (typeof req.query.eventCountLimit !== 'undefined' && typeof req.query.maxEventCount !== 'undefined') {
            return responseUtil.response400(res, "eventCountLimit and maxEventCount are mutually exclusive");
        } else if (typeof req.query.eventCountLimit !== 'undefined') {
            if (req.query.eventCountLimit < eventLimit) {
                eventLimit = req.query.eventCountLimit;
            }
        }
        const queryString = await this.builedQueryString(req.query);
        queryString.docType = 'event'
        console.log("queryString : ", queryString)


        //obj.$or = [
        //    { 'quantityList.quantity': { $lte: parameters.LE_quantity } },
        //    { 'childQuantityList.quantity': { $lte: parameters.LE_quantity } },

        //check gs1-extensions
        if (req.headers.hasOwnProperty('gs1-extensions')) {
            console.log("typeof req.headers['gs1-extensions'] : ", typeof req.headers['gs1-extensions'], req.headers['gs1-extensions']);
            var gsl_extensions = [];
            var extensions_header = req.headers['gs1-extensions'].split(",");
            extensions_header.forEach(element => {
                const key_val = element.split("=");
                //{"context." : key_val[1]}
                if (key_val.length = 2) {
                    //const ext_v=["context."+key_val[0]];
                    gsl_extensions.push({ ["context." + key_val[0]]: key_val[1] })
                }
            });
            console.log("gsl_extensions : ", gsl_extensions);
            queryString.$or = gsl_extensions;
        }
        let bookmark = ''
        //console.log("queryString : ", queryString);
        if (typeof req.query.nextPageToken !== 'undefined') {
            const token = req.query.nextPageToken.replace('rel="next"', '');
            bookmark = token;
            //obj._id=parameters.NextPageToken;
        }

        var sort = [{
            // Sort by field1 in ascending order
            //eventTime: "asc"
            //eventTime: "desc"
            //recordTime: "desc"
        }]

        if (typeof req.query.orderBy !== 'undefined') {
            if (typeof req.query.orderDirection !== 'undefined') {
                if (req.query.orderDirection === 'ASC') {
                    sort[req.query.orderBy] = 'asc';
                } else {
                    sort[req.query.orderBy] = 'desc';
                }
            } else {
                sort[req.query.orderBy] = 'desc'
            }
        }
        //sort._id = -1;
        console.log("sort : ", sort)

        if (typeof req.query.maxEventCount !== 'undefined') {
            const countResult = await events.countDocuments(queryString);
            if (countResult > req.query.maxEventCount) {
                return responseUtil.response413(res, "Max event : " + req.query.maxEventCount + "  Result :" + countResult);
            }
        }

        console.log("queryString   : ", queryString)

        let mangoQueryString = {};
        mangoQueryString.selector = queryString;
        mangoQueryString.sort = sort;
        //mangoQueryString.use_index = use_index;
        mangoQueryString = JSON.stringify(mangoQueryString)
        console.log("mangoQueryString : ", mangoQueryString);
        //let result2 = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
        if (typeof contract == 'undefined') {
            await evaluateContract();
        }
        let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, eventLimit.toString(), bookmark);

        let resultFabric = JSON.parse(resultTransction)
        if (typeof resultFabric.results !== undefined) {
            if (resultFabric.results.length > 0) {
                console.log(resultFabric.results.length, " events returned");

                var result = responseObj.responseOb;
                var contxtConstr = ["https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld"];
                res.set({ "maxEventCount": queryPar.maxEvent });

                let eventData = [];
                //construc @context
                for (const evn in resultFabric.results) {
                    eventData.push(resultFabric.results[evn].Record)
                }

                //construc @context
                for (const evn in eventData) {
                    for (const cont in eventData[evn].context) {
                        contextAdder(contxtConstr, cont, eventData[evn].context[cont], 1);
                    }
                }

                for (const evn in eventData) {
                    delete eventData[evn].context;
                    delete eventData[evn].docType;
                }

                result["@context"] = contxtConstr;
                result.creationDate = new Date().toJSON(),
                    result.epcisBody.queryResults.resultBody.eventList = eventData;
                return res.status(200).json(result);
            } else {
                return res.status(200).json([]);
            }
        }

    } catch (error) {
        console.log(error)
        responseUtil.response500(res, error);
    }

};

exports.getQueryResultByQueryName = async (req, res, queryVal) => {
    try {
        
        const [valStatus, valEror] = queryValidator.queryValidate(queryVal);
        if (!valStatus) {
            return responseUtil.response400(res, valEror);
        }

        //Building query string
        var eventLimit = queryPar.maxEvent;
        if (typeof req.query.perPage !== 'undefined') {
            if (0 < req.query.perPage && req.query.perPage <= queryPar.maxEvent) {
                //console.log("perpage: ", req.query.PerPage)
                eventLimit = req.query.perPage;
            }
        }
        if (typeof queryVal.eventCountLimit !== 'undefined' && typeof queryVal.maxEventCount !== 'undefined') {
            return responseUtil.response400(res, "eventCountLimit and maxEventCount are mutually exclusive");
        } else if (typeof queryVal.eventCountLimit !== 'undefined') {
            if (queryVal.eventCountLimit < eventLimit) {
                eventLimit = queryVal.eventCountLimit;
            }
        }
        const queryString = await this.builedQueryString(queryVal)
        queryString.docType = 'event';
        console.log("queryString : ", queryString)

        //check gs1-extensions
        if (req.headers.hasOwnProperty('gs1-extensions')) {
            console.log("typeof req.headers['gs1-extensions'] : ", typeof req.headers['gs1-extensions'], req.headers['gs1-extensions']);
            var gsl_extensions = [];
            var extensions_header = req.headers['gs1-extensions'].split(",");
            extensions_header.forEach(element => {
                const key_val = element.split("=");
                //{"context." : key_val[1]}
                if (key_val.length = 2) {
                    //const ext_v=["context."+key_val[0]];
                    gsl_extensions.push({ ["context." + key_val[0]]: key_val[1] })
                }
            });
            console.log("gsl_extensions : ", gsl_extensions);
            queryString.$or = gsl_extensions;
        }
        let bookmark = ''
        //console.log("queryString : ", queryString);
        if (typeof req.query.nextPageToken !== 'undefined') {
            const token = req.query.nextPageToken.replace('rel="next"', '');
            bookmark = token;
            //obj._id=parameters.NextPageToken;
        }

        var sort = [{
            // Sort by field1 in ascending order
            field1: "asc"
        }]
        if (typeof req.query.orderBy !== 'undefined') {
            if (typeof req.query.orderDirection !== 'undefined') {
                if (req.query.orderDirection === 'ASC') {
                    sort[req.query.orderBy] = 1;
                } else {
                    sort[req.query.orderBy] = -1;
                }
            } else {
                sort[req.query.orderBy] = -1
            }
        }
        //sort._id = -1;
        //console.log("sort : ", sort)

        if (typeof req.query.maxEventCount !== 'undefined') {
            const countResult = await events.countDocuments(queryString);
            if (countResult > req.query.maxEventCount) {
                return responseUtil.response413(res, "Max event : " + req.query.maxEventCount + "  Result :" + countResult);
            }
        }

        //console.log("queryString   : ", queryString)

        let mangoQueryString = {};
        mangoQueryString.selector = queryString;
        //mangoQueryString.sort = sort;
        mangoQueryString = JSON.stringify(mangoQueryString)
        console.log("mangoQueryString : ", mangoQueryString);
        //let result2 = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
        if (typeof contract == 'undefined') {
            await evaluateContract();
        }
        let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, eventLimit.toString(), bookmark);

        let resultFabric = JSON.parse(resultTransction)
        if (typeof resultFabric.results !== undefined) {
            if (resultFabric.results.length > 0) {
                console.log(resultFabric.results.length, " events returned");

                var result = responseObj.responseOb;
                var contxtConstr = ["https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld"];
                res.set({ "maxEventCount": queryPar.maxEvent });

                let eventData = [];
                //construc @context
                for (const evn in resultFabric.results) {
                    eventData.push(resultFabric.results[evn].Record)
                }

                //construc @context
                for (const evn in eventData) {
                    for (const cont in eventData[evn].context) {
                        contextAdder(contxtConstr, cont, eventData[evn].context[cont], 1);
                    }
                }

                for (const evn in eventData) {
                    delete eventData[evn].context;
                    delete eventData[evn].docType;
                }

                result["@context"] = contxtConstr;
                result.creationDate = new Date().toJSON(),
                    result.epcisBody.queryResults.resultBody.eventList = eventData;
                return res.status(200).json(result);
            } else {
                return res.status(200).json([]);
            }
        }
    } catch (error) {
        console.log(error)
        responseUtil.response500(res, error);
    }

};


//This one is for subscription 
exports.getQueryResultByQueryString = async (queryStringNamed) => {
    try {

        // Validate query String
        //const [valStatus, valEror] = queryValidator.queryValidate(JSON.stringify(req.query));
        console.log(queryStringNamed);
        const [valStatus, valEror] = queryValidator.queryValidate(queryStringNamed);
        if (!valStatus) {
            console.log(valEror);

        }
        //Building query string
        var eventLimit = queryPar.maxEvent;

        const queryString = await this.builedQueryString(queryStringNamed)
        console.log("queryString: ", queryString)

        events.find(queryString, function (err, eventData) {
            if (err) {
                console.log(err);
            }
            else {
                if (eventData.length > 0) {
                    console.log(eventData.length, " events returned");
                    var result = responseObj.responseOb;
                    //console.log()
                    result.creationDate = new Date().toJSON(),
                        result.epcisBody.queryResults.resultBody.eventList = eventData;
                    return [true, result];
                } else {
                    return [true, 0];
                }
            }
        }).limit(eventLimit);
    } catch (error) {
        console.log(String(error))
        return [false, error];
    }

};


function is_timeString(str) {
    //regexp = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    var regexp = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)/;


    if (regexp.test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function isValidDateFormat(dateString) {
    //const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}-\d{2}:\d{2}$/; // regular expression to match "YYYY-MM-DDTHH:mm:ss.SSSZ" format
    //const regex = /^\d{4}-\d{2}-\d{2}T\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?Z?$/;
    //const regex = /^\d{4}-\d{2}-\d{2}T\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?([+-]\d{2}:\d{2}|Z)?$/; // regular expression to match "YYYY-MM-DDTHH(:mm(:ss(.SSS)?)?)?+/-HH:mm" or "YYYY-MM-DDTHH(:mm(:ss(.SSS)?)?)?Z" format
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}(:\d{2}(:\d{2}(\.\d{1,3})?)?)?([+-]\d{2}:\d{2}|Z)?$/; // regular expression to match "YYYY-MM-DDTHH(:mm(:ss(.SSS)?)?)?+/-HH:mm" or "YYYY-MM-DDTHH(:mm(:ss(.SSS)?)?)?Z" format

    if (!regex.test(dateString)) {
        return false;
    }
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}