
const extensions = require("../config/extensions.js")
require('dotenv').config({ path: "./config/.env" })
const { checkQueryParameter } = require("../utils/commonUtils.js")

const queryUtilis = require("../utils/queryUtils.js")
const queryConfig = require("../config/queryConfig")
const cash = require('../utils/cacheVariables');
const subscriptionController = require("../controllers/subscriptionsController");

const RED = '\x1b[31m\n';
const GREEN = '\x1b[32m\n';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
//const responseObj = require("../models/response.js");

validator = require("../validators/epcisValidator.js")
queryValidator = require("../validators/queryValidator")

const { v4: uuidv4 } = require('uuid');

const { getContract } = require('../utils/networkContractUtil.js');
const { async } = require("node-couchdb/dist/node-couchdb.js")

let contract;
let gateway;
async function evaluateContract() { 
    [contract, gateway] = await getContract();     
}
evaluateContract();


async function addContractListenerLocal(){
    if (typeof contract == 'undefined') {
        await evaluateContract();
    }
    listener = async (event) => {
        const asset = JSON.parse(event.payload.toString());
        console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${JSON.stringify(asset)}${RESET}`);
    };
    // now start the client side event service and register the listener
    console.log(`${GREEN}--> Start contract event stream to peer in Org1${RESET}`);
    await contract.addContractListener(listener);
}



//const { connectToContract } = require('../networkContract.js');
//const [contract, gateway] = await connectToContract();
//const { contract, gateway } = require("../utils/networkContractUtil");


/*
const events = require("../models/Events.js");
const bizSteps = require("../models/BizSteps.js");
const bizLocations = require("../models/BizLocations.js");
const dispositions = require("../models/Dispositions.js");
const eventTypes = require("../models/EventTypes.js");
const readPoints = require("../models/ReadPoints");
const epcs = require("../models/EPCs");

parameters:
        - $ref: "#/components/parameters/GS1-EPCIS-Version"
        - $ref: "#/components/parameters/GS1-CBV-Version"
*/
exports.eventPost = async (req, res) => {

    try {
        res.set({
            "GS1-EPCIS-Version": "2.0",
            "GS1-CBV-Version": "2.0",
            "GS1-Extensions": extensions.GS1Extensions,
            "Location": process.env.ROOT_END_POINT + "/capture/" + "EventID",
        });
        const [queryCheck, queryCheckError] = checkQueryParameter(req.query);
        if (!queryCheck) {
            res.status(400).send(queryCheckError);
            return;
        }
        let event = req.body;
        //console.log(req.body);

        const [valStatus, valEror] = validator.epcValidate(event);
        if (!valStatus) {
            res.status(400).send(valEror);
            return;
        }

        if ((event.type === "EPCISDocument") || (event.type === "EPCISQueryDocument")) {
            return res.status(400).json({
                "type": "epcisException:ValidationException",
                "title": "EPCIS query exception",
                "status": 400,
                "detail": event.type + " is captured using /capture end point"
            });
        }

        let contextG = {};
        if (typeof event['@context'] !== 'undefined') {
            const epcisDocument_context = event['@context'];
            for (var attributename in epcisDocument_context) {
                if (typeof epcisDocument_context[attributename] === 'object') {
                    for (var nested in epcisDocument_context[attributename]) {
                        contextG[nested] = epcisDocument_context[attributename][nested];
                    }
                }
            }
        }

        delete event['@context'];
        event.context = contextG;
        event.docType = 'event'

        //set event record time
        event.recordTime = new Date().toJSON();

        if (typeof contract == 'undefined') {
            await evaluateContract();
            //await addContractListenerLocal();
        }
        //Handling eventType
        if (typeof event.type !== 'undefined') {
            //console.log("cash.eventType : ", cash.eventType)
            if (!cash.eventType.includes(event.type)) {
                var contextval = {}
                const extntion = event.type.split(':');
                if (extntion.length > 1) {
                    Object.keys(contextG).forEach(function (key) {
                        if (key == extntion[0]) {
                            contextval[extntion[0]] = contextG[key]
                        }
                    });
                }
                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'eventType';
                vocab.voc = event.type;
                vocab.context = contextval;
                const vocabString = JSON.stringify(vocab);

                console.log('\n--> Submit Transaction: capture vocabulary type');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                cash.eventType.push(event.type);

            }

        }

        //Handling bizStep
        if (typeof event.bizStep !== 'undefined') {
            if (!cash.bizStep.includes(event.bizStep)) {
                var contextval = {}
                const extntion = event.bizStep.split(':');
                if (extntion.length > 1) {
                    Object.keys(contextG).forEach(function (key) {
                        if (key == extntion[0]) {
                            contextval[extntion[0]] = contextG[key]
                        }
                    });
                }

                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'bizStep';
                vocab.voc = event.bizStep;
                vocab.context = contextval;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary bizStep');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));

                cash.bizStep.push(event.bizStep);
            }
        }

        //Handling disposition  
        if (typeof event.disposition !== 'undefined') {
            if (!cash.disposition.includes(event.disposition)) {
                var contextval = {}
                const extntion = event.disposition.split(':');
                if (extntion.length > 1) {
                    Object.keys(contextG).forEach(function (key) {
                        if (key == extntion[0]) {
                            contextval[extntion[0]] = contextG[key]
                        }
                    });
                }

                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'disposition';
                vocab.voc = event.disposition;
                vocab.context = contextval;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary disposition');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));

                cash.disposition.push(event.disposition);

            }
        }

        //Handling bizLocation 
        if (typeof event.bizLocation !== 'undefined') {
            if (!cash.bizLocation.includes(event.bizLocation.id)) {
                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'bizLocation';
                vocab.voc = event.bizLocation.id;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary bizLocation');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                //bizLocations.collection.updateOne({ bizLoc: event.bizLocation.id }, { $setOnInsert: { bizLoc: event.bizLocation.id } }, { upsert: true });
                cash.bizLocation.push(event.bizLocation.id);
            }
        }
        //Handling readPoint   
        if (typeof event.readPoint !== 'undefined') {
            if (!cash.readPoint.includes(event.readPoint.id)) {
                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'readPoint';
                vocab.voc = event.readPoint.id;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary readPoint');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                //readPoints.collection.updateOne({ readPoint: event.readPoint.id }, { $setOnInsert: { readPoint: event.readPoint.id } }, { upsert: true });
                cash.readPoint.push(event.readPoint.id);
            }
        }

        //Handling epcs
        let epcsList = []
        if (typeof event.epcList !== 'undefined') {
            for (const epc in event.epcList) {
                for (const epc in event.epcList) { epcsList.push({ "EPC": event.epcList[epc] }); }
                //epcs.collection.insertOne({"_id":event.epcList[epc], "EPC":event.epcList[epc]}, function (err, docs) {});
            }
        }
        if (typeof event.parentID !== 'undefined') { epcsList.push({ "EPC": event.parentID }); }
        if (typeof event.childEPCs !== 'undefined') {
            for (const epcChild in event.childEPCs) { epcsList.push({ "EPC": event.childEPCs[epcChild] }); }
        }
        if (typeof event.inputEPCList !== 'undefined') {
            for (const epcInList in event.inputEPCList) { epcsList.push({ "EPC": event.inputEPCList[epcInList] }); }
        }
        if (typeof event.outputEPCList !== 'undefined') {
            for (const epcOutList in event.outputEPCList) { epcsList.push({ "EPC": event.outputEPCList[epcOutList] }); }
        }

        epcsList.forEach(async epcElement => {
            if (!cash.epcsList.includes(epcElement.EPC)) {
                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'epc';
                vocab.voc = epcElement.EPC;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary EPC');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                //epcs.collection.updateOne({ epc: epcElement.EPC }, { $setOnInsert: { epc: epcElement.EPC } }, { upsert: true })
                cash.epcsList.push(epcElement.EPC);
            }
        });


        const args = JSON.stringify(event);
        console.log("args : ", args)


        //CaptureEvent
        console.log('\n--> Submit Transaction: capture single event');
        const response = await contract.submitTransaction('CaptureEvent', args);
        console.log('*** Result: committed');

        const resposneText = "Successfully captured one " + event.type;
        //console.log(resposneText); // Success!
        res.set({ "Location": process.env.ROOT_END_POINT + "/capture/" + event.eventID });
        res.status(202).send(resposneText);
        if(queryConfig.SubscriptionStatus){
            subscriptionController.onStreamSubscription(dataList);
        }

    } catch (error) {
        console.log(error);
        console.log({ message: error.message });
        res.status(400).send(error.message)
    }

};


exports.eventGet = async (req, res) => {
    queryUtilis.getQueryResult(req, res);
    /*
    let queryString = {};
    queryString.selector = {};
    
    Object.keys(req.query).forEach(function (key) {
        req.query[key] = JSON.parse(req.query[key])
    });

    if (typeof req.query.eventType !== 'undefined') {
        queryString.selector.type = { $in: req.query.eventType };
    }
    queryString = JSON.stringify(queryString)
    console.log(req.query);
    console.log(queryString);
    


    

    let result = await contract.evaluateTransaction('QueryEPCIS', queryString);
    console.log(JSON.parse(result));
    return res.json(JSON.parse(result))
*/
    //console.log('\n--> Evaluate Transaction: GetAssetsByRange, function returns assets in a specific range from asset1 to before asset6');
    //let result2 = await contract.evaluateTransaction('ReadAsset', 'ni:///sha-256;df7bb3c352fef055578554f09f5e2aa41782150ced7bd0b8af24dd3ccb30ba69?ver=CBV2.0');
    //console.log(`*** Result: ${prettyJSONString(result.toString())}`);
    //return res.json(JSON.parse(result2))
    //queryUtilis.getQueryResult(req, res);
};



exports.eventsGetEvId = (req, res) => {


};





