
const extensions = require("../config/extensions.js")
const queryConfig = require("../config/queryConfig")

const responseUtil = require("../utils/responseUtils.js");

validator = require("../validators/epcisValidator.js")
const { v4: uuidv4 } = require('uuid');

const cash = require('../utils/cacheVariables');

const { getContract } = require('../utils/networkContractUtil.js');

let contract;
let gateway;
async function evaluateContract() { [contract, gateway] = await getContract();}
evaluateContract();



const subscriptionController = require("../controllers/subscriptionsController");
const { async } = require("node-couchdb/dist/node-couchdb.js");


let counter = 0;
let captureJobs = {}
function addJobs(id, Error_beh) {
    captureJobs[id] = {
        "captureID": id,
        "createdAt": new Date().toJSON(),
        "running": true,
        "success": true,
        "captureErrorBehaviour": Error_beh,
        "errors": []
    }
}

function updateJobs(id, successStat, error) {
    if (successStat) {
        captureJobs[id].finishedAt = new Date().toJSON();
        captureJobs[id].running = false;

    } else {
        captureJobs[id].finishedAt = new Date().toJSON();
        captureJobs[id].running = false;
        captureJobs[id].errors.push(error)
    }

}




exports.test = (req, res) => {
    res.send("Test resposne from captureController");
};




//let captureEvent = function
exports.capture_4 = (req, res) => {
    const body = req.body;
    const [valStatus, valEror] = validator.epcValidate(body);
    if (!valStatus) {
        res.status(400).send(valEror);
    } else {
        //console.log(body.epcisBody.eventList)
        console.log("array length : ", body.epcisBody.eventList.length)
        const data = new ObjectEvent(body.epcisBody.eventList)
        try {
            const dataToSave = data.save();
            counter++;
            let captureJobID = "id" + counter;
            addJobs(captureJobID);
            console.log(captureJobs);
            dataToSave.then(
                (value) => {
                    console.log("value"); // Success!
                    updateJobs(captureJobID);
                    console.log(captureJobs);
                },
                (reason) => {
                    console.error("reason"); // Error!
                },
            );
            console.log("Succesfully captured");
            res.status(200).json(captureJobs[captureJobID])
        } catch (error) {
            console.log({ message: error.message });

        }

        //for (var item in body.epcisBody.eventList) {console.log(item)}

        //const data = new Freelancers(data_body)
        //const data = new epcisAll(body.epcisBody.eventList)
        /*
        console.log(data);
        try{
            const dataToSave = data.save();
            
        }catch (error) {
            console.log({message: error.message});
            
        }
        */
        //res.send("Test resposne from captureController post");
    }

};

function checkQueryParameter(parameters) {
    if (parameters.hasOwnProperty('GS1-EPCIS-Version')) {
        if (parameters['GS1-EPCIS-Version'] != 2.0) {
            return [false, "Only GS1-EPCIS-Version = 2.0 is supported"]
        }
    }
    if (parameters.hasOwnProperty('GS1-CBV-Version')) {
        if (parameters['GS1-CBV-Version'] != 2.0) {
            return [false, "Only GS1-CBV-Version = 2.0 is supported"]
        }
    }

    return [true, "all checked"]

}

//let captureEvent = function
exports.capture = async (req, res) => {
    try {
        const [queryCheck, queryCheckError] = checkQueryParameter(req.query);
        if (!queryCheck) {
            return res.status(400).send(queryCheckError);
        }

        const epcisDocument = req.body;
        const [valStatus, valEror] = validator.epcValidate(epcisDocument);
        if (!valStatus) {
            res.status(400).send(valEror);
        } else {

            let contextG = {};
            if (typeof epcisDocument['@context'] !== 'undefined') {
                const epcisDocument_context = epcisDocument['@context'];
                for (var attributename in epcisDocument_context) {
                    if (typeof epcisDocument_context[attributename] === 'object') {
                        for (var nested in epcisDocument_context[attributename]) {
                            contextG[nested] = epcisDocument_context[attributename][nested];
                        }
                    }
                }
            }

            //check gs1-extensions
            var gsl_extensions = {};
            if (req.headers.hasOwnProperty('gs1-extensions')) {
                console.log("typeof req.headers['gs1-extensions'] : ", typeof req.headers['gs1-extensions'], req.headers['gs1-extensions']);
                var extensions_header = req.headers['gs1-extensions'].split(",");
                extensions_header.forEach(element => {
                    const key_val = element.split("=");
                    if (key_val.length = 2) {
                        gsl_extensions[key_val[0]] = key_val[1];
                    }
                });
                //console.log("gsl_extensions : ", gsl_extensions);
                //queryString.$or = gsl_extensions;
            }

            if (typeof contract == 'undefined') {
                await evaluateContract();
            }


            //master data check and capture
            let masterDataresposneText = "";
            let masterDataCount = 0;
            if (epcisDocument.epcisHeader) {
                if (epcisDocument.epcisHeader.epcisMasterData) {
                    if (epcisDocument.epcisHeader.epcisMasterData.vocabularyList) {
                        const vacList = epcisDocument.epcisHeader.epcisMasterData.vocabularyList;
                        for (const vlkey in vacList) {
                            if (vacList[vlkey].vocabularyElementList) {
                                const vocElementList = vacList[vlkey].vocabularyElementList;
                                for (const vEkey in vocElementList) {
                                    let vocElement = vocElementList[vEkey];
                                    if (typeof vocElement.type == 'undefined') {
                                        vocElement.type = vacList[vlkey].type;
                                    }
                                    if (typeof vocElement.id !== 'undefined') {
                                        //var query = { id: vocElement.id };
                                        let newContxt = {};
                                        getContext(vocElement, contextG, newContxt)
                                        vocElement.context = newContxt;
                                        masterDataCount++;
                                        const vocElementString = JSON.stringify(vocElement);
                                        console.log("vocElementString : ", vocElementString);
                                        console.log('\n--> Submit Transaction: capture master data');
                                        const response = await contract.submitTransaction('CaptureMasterData', vocElementString);
                                        console.log('*** Result: committed from masterdata', JSON.parse(response));
                                        

                                        /*
                                        masterDataModel.findOneAndUpdate(query, vocElement, { upsert: true }, function (err, doc) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("Succesfully saved");
                                            }
                                        });
                                        */
                                    }
                                }
                            }

                        }
                    }
                }
            }


            let captureErrorBehaviour = "proceed";
            if (req.query.hasOwnProperty('GS1-Capture-Error-Behaviour')) {
                if (["rollback", "proceed"].includes(req.query['GS1-Capture-Error-Behaviour'])) {
                    captureErrorBehaviour = req.query['GS1-Capture-Error-Behaviour'];
                } else {
                    let resp_Text = req.query['GS1-Capture-Error-Behaviour'] +
                        "GS1-Capture-Error-Behaviour is not defined";
                    res.status(400).send(resp_Text);
                    return;
                }
            }
            let eventList;
            if (epcisDocument.type == 'EPCISQueryDocument' || epcisDocument.isA == 'EPCISQueryDocument') {
                eventList = epcisDocument.epcisBody.queryResults.resultsBody.eventList;
            } else {
                eventList = epcisDocument.epcisBody.eventList;
                if (typeof eventList == 'undefined') {
                    res.status(400).send("eventList is not included")
                    return;
                }
            }

            if (masterDataCount > 0) {
                masterDataresposneText = masterDataCount + " Master Data";
                if (eventList) {
                    if (eventList.length == 0) {
                        return res.status(202).send("Successfully received " + masterDataresposneText);
                    }
                }
            }

            if (typeof eventList !== 'undefined') {
                if (eventList.length == 0) {
                    return res.status(200).send(" No event was provided ");
                }
            }

            if (typeof eventList !== 'undefined') {
                if (eventList.length > queryConfig.maxEventCapture) {
                    return res.status(416).send(" Number of events per single capture excedded the limit ");
                }
            }

            //return;

            counter++;
            //console.log("counter : ", counter);
            let captureJobID = "id" + counter.toLocaleString('en-US', { minimumIntegerDigits: 10, useGrouping: false });
            addJobs(captureJobID, captureErrorBehaviour);
            //console.log(captureJobs);


            //console.log(eventList)
            //let eventListlength = eventList.length
            //console.log("Number of Events: ",eventListlength)
            let dataList = []
            let bizStepsList = [],
                bizLocList = [],
                dispList = [],
                eventTypesList = [],
                readPointList = [],
                epcsList = []


            
            captureAsync(eventList, contextG)
                .then(result => {
                    updateJobs(captureJobID, true, "")
                    //console.log(captureJobs);
                    if (queryConfig.SubscriptionStatus) {
                        subscriptionController.onStreamSubscription(dataList);
                    }
                })
                .catch(error => {
                    updateJobs(captureJobID, true, error)
                    return console.error(error);
                })

            const resposneText = "Successfully received " + eventList.length + " EPCIS events";
            res.set({
                "GS1-EPCIS-Version": "2.0",
                "GS1-CBV-Version": "2.0",
                "GS1-Extensions": JSON.stringify(contextG),
                "Location": " /capture/" + captureJobID,
            });
            res.status(202).send(resposneText)
        }

    }
    catch (error) {
        console.log(error);
        //console.log(String(error))
        responseUtil.response500(res, error);
    }











};



async function captureAsync(eventList, contextG) {

    for (let i = 0; i < eventList.length; i++) {
        let event = eventList[i];

        event.docType = 'event'

        //Handling eventType
        if (typeof event.type !== 'undefined') {
            console.log("cash.eventType : ", cash.eventType)
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

                cash.bizStep.push(event.disposition);

            }
        }

        //Handling bizLocation 
        if (typeof event.bizLocation !== 'undefined') {
            if (!cash.bizLocation.includes(event.bizLocation)) {
                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'bizLocation';
                vocab.voc = event.bizLocation.id;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary bizLocation');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                //bizLocations.collection.updateOne({ bizLoc: event.bizLocation.id }, { $setOnInsert: { bizLoc: event.bizLocation.id } }, { upsert: true });
                cash.bizLocation.push(event.bizLocation);
            }
        }
        //Handling readPoint   
        if (typeof event.readPoint !== 'undefined') {
            if (!cash.readPoint.includes(event.readPoint)) {
                let vocab = {};
                vocab.ID = uuidv4();
                vocab.docType = 'readPoint';
                vocab.voc = event.readPoint.id;
                const vocabString = JSON.stringify(vocab);
                console.log('\n--> Submit Transaction: capture vocabulary readPoint');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                //readPoints.collection.updateOne({ readPoint: event.readPoint.id }, { $setOnInsert: { readPoint: event.readPoint.id } }, { upsert: true });
                cash.readPoint.push(event.readPoint);
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
                console.log('\n--> Submit Transaction: capture vocabulary epc');
                const response = await contract.submitTransaction('CaptureVocabulary', vocabString);
                console.log('*** Result: committed', JSON.parse(response));
                //epcs.collection.updateOne({ epc: epcElement.EPC }, { $setOnInsert: { epc: epcElement.EPC } }, { upsert: true })
                cash.epcsList.push(epcElement.EPC);
            }
        });

        event.context = contextG;

        const args = JSON.stringify(event);
        //console.log("args : ", args)


        //CaptureEvent
        console.log('\n--> Submit Transaction: capture single event');
        const responseEvent = await contract.submitTransaction('CaptureEvent', args);
        console.log('*** Result: committed evet capture', JSON.parse(responseEvent));

    }



}


//parameters check not yet implimented
//pagnation not yet supported 
/*
parameters:
      - $ref: "#/components/parameters/NextPageToken"
      - $ref: "#/components/parameters/PerPage"
      - $ref: "#/components/parameters/GS1-EPCIS-Min"
      - $ref: "#/components/parameters/GS1-EPCIS-Max"
      - $ref: "#/components/parameters/GS1-Extensions"
  */
exports.captureGet = (req, res) => {
    res.set({
        "GS1-EPCIS-Version": "2.0",
        "Link": "Not Yet supported",
        "GS1-Extensions": extensions.GS1Extensions,
        "GS1-Next-Page-Token-Expires": "Not yet supported",
    });
    let resposneArr = [];
    for (let jobs in captureJobs) {
        resposneArr.push(captureJobs[jobs]);
    }
    res.status(200).json(resposneArr);
};


//parameters check not yet implimented
//pagnation not yet supported 
/*
parameters:
      - $ref: "#/components/parameters/NextPageToken"
      - $ref: "#/components/parameters/PerPage"
      - $ref: "#/components/parameters/GS1-EPCIS-Min"
      - $ref: "#/components/parameters/GS1-EPCIS-Max"
      - $ref: "#/components/parameters/GS1-Extensions"
  */
exports.captureGetId = (req, res) => {
    const captureId = req.params.captureID;
    res.set({
        "GS1-EPCIS-Version": "2.0",
        "Link": "Not Yet supported",
        "GS1-Extensions": extensions.GS1Extensions,
        "GS1-Next-Page-Token-Expires": "Not yet supported",
    });

    res.status(200).json(captureJobs[captureId]);
};





/*
check every element and value contains extension and 
assign in into newContext as pass by reference
*/
function getContext(data, context, newContext) {
    if (typeof data === 'string') {
        if (data.includes(':')) {
            for (var cont in context) {
                if (data.startsWith(cont + ':')) {
                    newContext[cont] = context[cont];
                }
            }
        }
        return;
    }

    for (var attributename in data) {
        if (attributename.includes(':')) {
            for (var cont in context) {
                if (attributename.startsWith(cont + ':')) {
                    newContext[cont] = context[cont];
                }
            }
        }

        getContext(data[attributename], context, newContext);
    }


}





