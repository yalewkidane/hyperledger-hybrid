
const extensions = require("../config/extensions.js")
require('dotenv').config({ path: "./config/.env" })
var request = require('request');
const { checkQueryParameter } = require("../utils/commonUtils.js")

const queryUtilis = require("../utils/queryUtils.js")
const queryConfig = require("../config/queryConfig")
const cash = require('../utils/cacheVariables');
const subscriptionController = require("../controllers/subscriptionsController");
const externalService = require('../config/service.js');

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

exports.blockChainTest = async (req, res) => {
    if (typeof contract == 'undefined') {
        await evaluateContract();
        //await addContractListenerLocal();
    }
    //console.log("req.body : ", req.body);
    //console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID(asset7), color(yellow), size(5), owner(Tom), and appraisedValue(1300) arguments');
    //const assetID=uuidv4();
	await contract.submitTransaction('CreateAsset', req.body.id, 'yellow', '5', 'Tom', '1300');
	//console.log('*** Result: committed');
    return res.status(202).json([]);
}
exports.blockChainHashTest = async (req, res) => {
    if (typeof contract == 'undefined') {
        await evaluateContract();
        //await addContractListenerLocal();
    }
    //console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID(asset7),')
	await contract.submitTransaction('CaptureEventHash', req.body.id);
	//console.log('*** Result: committed');
    return res.status(202).json([]);
}



async function blockChainHashCapture (hash){
    if (typeof contract == 'undefined') {
        await evaluateContract();
        //await addContractListenerLocal();
    }
    //console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID(asset7),')
	return contract.submitTransaction('CaptureEventHash', hash);
	//console.log('*** Result: committed');
}

async function requestService(URL, epcisDoc) {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: URL,
          method: "POST",
          body: epcisDoc,
          json: true,
        },
        function (error, response, body) {
          if (!error) {
            resolve(body);
          } else {
            console.log(error);
            reject(null);
          }
        }
      );
    });
  }


async function captureEvent(hash, eventBody) {
    const offChain = requestService(externalService.epcis, eventBody);
    const onChain = blockChainHashCapture(hash);
  
    await Promise.all([offChain, onChain]);
  
    // Both functions have completed running
    //console.log("offChain : ",offChain);
    //console.log("onChain  : ", onChain);
    //console.log("Both functions have finished running");
  }


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
            console.log("validation error",queryCheckError);
            res.status(400).send(queryCheckError);
            return;
        }
        let event = req.body;
        //console.log(req.body);

        const [valStatus, valEror] = validator.epcValidate(event);
        if (!valStatus) {
            console.log("validation error",valEror);
            res.status(400).send(valEror);
            return;
        }

        //
        const resoponseHash = await requestService(externalService.hashGenerator, event);
        if(resoponseHash !==null){
            if(resoponseHash.length>0){
                //console.log("resoponseHash : ", resoponseHash);
                try{
                    await captureEvent(resoponseHash[0], event)
                    const resposneText = "Successfully captured one " + event.type;
                    res.status(202).send(resposneText);
                }catch(error){
                    res.status(400).send(error.message)
                }
                
            }
        }
       

    } catch (error) {
        console.log(error);
        console.log({ message: error});
        res.status(400).send(error)
    }

};





