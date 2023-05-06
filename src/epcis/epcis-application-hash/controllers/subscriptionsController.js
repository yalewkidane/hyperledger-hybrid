
const extensions = require("../config/extensions.js")
require('dotenv').config({ path: "./config/.env" })
const queryUtils = require("../utils/queryUtils");
const queryPar = require("../config/queryConfig.js")
//const eventsModel = require("../models/Events.js");
const responseObj = require("../models/response.js");
const checker = require("../utils/checkUtils.js");
const responseUtil = require("../utils/responseUtils.js");
//const queriesModel = require("../models/Queries");
//const eventsInMemoryModel = require("../models/EventsInMemory");
//const subscriptionModel = require("../models/Subscription");
const queryValidator = require("../validators/queryValidator")
const WebsocketController = require("./subscriptionWebsocketController")
var request = require('request');
//https://github.com/uuidjs/uuid
const { v4: uuidv4 } = require('uuid');
var cron = require('node-cron');


const mingo = require('mingo');

var _this = this;

const { getContract } = require('../utils/networkContractUtil.js');

let contract;
let gateway;
async function evaluateContract() { [contract, gateway] = await getContract(); }
evaluateContract();



exports.getQueryWithQueryName = async (queryName) => {
  if (typeof contract == 'undefined') {
    await evaluateContract();
  }
  var queryString = {};
  queryString.docType = 'queries';
  queryString.name = queryName;
  let mangoQueryString = {};
  mangoQueryString.selector = queryString;
  mangoQueryString = JSON.stringify(mangoQueryString)
  let resultTransction = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
  resultTransction = JSON.parse(resultTransction);
  return resultTransction;
}

exports.getSubscriptionWithSubscriptionID = async (subscriptionID) => {
  if (typeof contract == 'undefined') {
    await evaluateContract();
  }
  var queryString = {};
  queryString.docType = 'subscription';
  queryString.subscriptionID = subscriptionID;
  let mangoQueryString = {};
  mangoQueryString.selector = queryString;
  mangoQueryString = JSON.stringify(mangoQueryString);
  let resultTransction = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
  resultTransction = JSON.parse(resultTransction);
  return resultTransction;
}



//Get /queries/:queryName/subscriptions
exports.queryNameSubscriptionsGet = async (req, res) => {
  try {

    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError)
    }

    var responseLimit = 30;
    var queryString = {}
    if (req.query.PerPage) {
      responseLimit = req.query.PerPage;
    }
    let bookmark = ''
    //console.log("queryString : ", queryString);
    if (typeof req.query.nextPageToken !== 'undefined') {
      const token = req.query.nextPageToken.replace('rel="next"', '');
      bookmark = token;
      //obj._id=parameters.NextPageToken;
    }
    if (typeof contract == 'undefined') {
      await evaluateContract();
    }

    queryString.queryName = req.params.queryName;
    queryString.docType = 'subscription';

    let mangoQueryString = {};
    mangoQueryString.selector = queryString;
    mangoQueryString = JSON.stringify(mangoQueryString)

    let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, responseLimit.toString(), bookmark);

    let resultFabric = JSON.parse(resultTransction)
    if (typeof resultFabric.results !== undefined) {
      if (resultFabric.results.length > 0) {
        let subscriptions = [];
        resultFabric.results.forEach(resul => {
          subscriptions.push(resul.Record)
        });
        for (const ind in subscriptions) {
          delete subscriptions[ind].docType;
        }

        const next = resultFabric.bookmark;
        var Link = process.env.ROOT_END_POINT + "/queries/" + req.params.queryName + "/subscriptions?perPage=" + responseLimit +
          "&nextPageToken=" + next;
        if (subscriptions.length >= responseLimit) {
          Link = Link + 'rel="next"';
        }
        res.set({ "Link": Link });
        res.set({ "GS1-Next-Page-Token-Expires": "NA" });
        return res.status(200).json(subscriptions);

      } else {
        return res.status(200).json([]);
      }
    } else {
      return responseUtil.response404(res, "");
    }

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};


exports.queryNameSubscriptionsPost = async (req, res) => {
  try {

    //console.log(req.headers) 
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError)
    }

    //check if named query exist
    const queryName = req.params.queryName;
    let resultTransction = await _this.getQueryWithQueryName(queryName);
    if (resultTransction.length > 0) {
      const subscriptionID = uuidv4()
      console.log(subscriptionID);
      req.body.createdAt = new Date().toJSON();
      req.body.subscriptionID = subscriptionID;
      if (typeof req.body.initialRecordTime === 'undefined') {
        req.body.initialRecordTime = new Date().toJSON();
      }
      if (typeof req.body.reportIfEmpty === 'undefined') {
        req.body.reportIfEmpty = false;
      }
      req.body.minRecordTime = req.body.initialRecordTime;
      //req.body.lastNotifiedAt = new Date().toJSON();
      req.body['GS1-EPC-Format'] = "Always_GS1_Digital_Link";
      if (req.headers['gs1-epc-format']) {
        req.body['GS1-EPC-Format'] = req.headers['gs1-epc-format'];
      }
      req.body.queryName = queryName;
      if (typeof req.body.dest === 'undefined') {
        return responseUtil.response406(res, "destination is required for subscription");
      }
      if (typeof req.body.schedule !== 'undefined') {
        //
        console.log(req.body.schedule)
        var schedule = req.body.schedule;

        var second = ' * ';
        var minute = ' * ';
        var hour = ' * ';
        var dayOfMonth = ' * ';
        var month = ' * ';
        var dayOfWeek = ' * ';
        if (typeof schedule.second !== 'undefined') { second = ' ' + schedule.second + ' ' }
        if (typeof schedule.minute !== 'undefined') { minute = ' ' + schedule.minute + ' ' }
        if (typeof schedule.hour !== 'undefined') { hour = ' ' + schedule.hour + ' ' }
        if (typeof schedule.dayOfMonth !== 'undefined') { dayOfMonth = ' ' + schedule.dayOfMonth + ' ' }
        if (typeof schedule.month !== 'undefined') { month = ' ' + schedule.month + ' ' }
        if (typeof schedule.dayOfWeek !== 'undefined') { dayOfWeek = ' ' + schedule.dayOfWeek + ' ' }

        let sh_time = second + minute + hour + dayOfMonth + month + dayOfWeek;
        //console.log("schdule time : ", sh_time)
        schduleSubscription(res, sh_time, subscriptionID);
        await _this.saveSubscription(req.body);
        delete req.body._id;
        delete req.body.docType;
        return res.status(201).json(req.body);
      } else if (typeof req.body.stream !== 'undefined') {
        //need to han
        //console.log(req.body.stream);
        _this.saveSubscription(req.body);
        return res.status(201).json(req.body);
      }
    } else {
      console.log('resource not found, query name doesnt exist')
      return responseUtil.response404(res, "");
    }

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};

var scheduled_jobs = {};

function schduleSubscription(res, sh_time, subscriptionID) {
  var valid = cron.validate(sh_time);
  if (valid) {
    scheduled_jobs[subscriptionID] = cron.schedule(sh_time, () => {
      serveSubscription(subscriptionID);
      console.log('Serving a clinet with subscriptionID', subscriptionID);
    });
  } else {
    return responseUtil.response406(res, "schedule parameters are not formated");
  }

}

//when deliting subsription 
exports.stopSchduleSubscription = (subscriptionID) => {
  if (scheduled_jobs[subscriptionID]) {
    scheduled_jobs[subscriptionID].stop();
  } else {
    console.log(subscriptionID, " is not scheduled");
  }

}

//Schduled webhook service 
async function serveSubscription(_subscriptionID) {
  const subscriptions = await _this.getSubscriptionWithSubscriptionID(_subscriptionID);
  //const subscriptions = await subscriptionModel.find({ subscriptionID: _subscriptionID, schedule: { $exists: true } }, { _id: 0 });
  if (subscriptions.length > 0) {
    const queries = await _this.getQueryWithQueryName(subscriptions[0].Record.queryName);
    //const queries = await queriesModel.find({ name: subscriptions[0].queryName }, { _id: 0 });
    if (queries.length > 0) {
      let queryName = queries[0].Record;
      queryName.query.GE_recordTime = subscriptions[0].Record.minRecordTime;
      console.log(queryName.query);
      //this is validatde
      const [valStatus, valEror] = queryValidator.queryValidate(queryName.query);
      if (!valStatus) { console.log("query Validation : ", valEror); }

      var eventLimit = queryPar.maxEvent;

      const queryString = await queryUtils.builedQueryString(queryName.query)
      console.log("queryString: ", queryString);

      let mangoQueryString = {};
      mangoQueryString.selector = queryString;
      //mangoQueryString.sort = sort;
      mangoQueryString = JSON.stringify(mangoQueryString)
      console.log("mangoQueryString : ", mangoQueryString);
      let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, eventLimit.toString(), "");
      let resultFabric = JSON.parse(resultTransction)
      if (typeof resultFabric.results !== undefined) {
        if (resultFabric.results.length > 0) {
          let eventData = [];
          for (const evn in resultFabric.results) {
            eventData.push(resultFabric.results[evn].Record)
          }
          sendSubscriptionWebHook(subscriptions[0].Record, eventData)
        } else if (resultFabric.results.length == 0) {
          if (subscriptions[0].reportIfEmpty) {
            sendSubscriptionWebHook(subscriptions[0].Record, [])
          }
        }
      }
    }
  }
}

function makeResultBody(eventData) {
  result = responseObj.responseOb;
  result.creationDate = new Date().toJSON();
  result.epcisBody.queryResults.resultBody.eventList = eventData;
  return result;
}

function sendSubscriptionWebHook(subscription, eventData) {
  const _subscriptionID = subscription.subscriptionID

  result = makeResultBody(eventData)

  var headersOpt = {
    "content-type": "application/json",
  };
  if (typeof subscription.signatureToken !== 'undefined') { headersOpt.signatureToken = subscription.signatureToken }
  //console.log(headersOpt);
  request({ uri: subscription.dest, method: 'POST', body: result, json: true, headers: headersOpt }, function (error, response, body) {
    if (!error) {
      subscription.lastNotifiedAt = new Date().toJSON();
      subscription.minRecordTime = new Date().toJSON()
      _this.saveSubscription(subscription);
    }
    else {
      console.log("The client with subscription id ", _subscriptionID, " is unreachable");
      console.log("error : ", error);
    }
  });

}

exports.saveSubscription = async (subscription) => {
  if (typeof contract == 'undefined') {
    await evaluateContract();
  }
  subscription.docType = 'subscription';
  console.log('\n--> Submit Transaction: Capture Subscription');
  const response = await contract.submitTransaction('CaptureSubscription', JSON.stringify(subscription));
  console.log('*** Result: committed from masterdata', JSON.parse(response));
}



//GET /queries/:queryName/subscriptions/:subscriptionID
exports.queryNameSubscriptionsWithIDGet = async (req, res) => {
  try {
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError);
    }

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });
    const subscriptionIDVal = req.params.subscriptionID;
    let subscriptionResultTransction = await _this.getSubscriptionWithSubscriptionID(subscriptionIDVal);
    if (subscriptionResultTransction.length > 0) {
      res.status(200).json(subscriptionResultTransction[0].Record)
    } else {
      responseUtil.response404(res);
    }
  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};

exports.queryNameSubscriptionsWithIdDelete = async (req, res) => {
  try {
    const queryNameVal = req.params.queryName;
    const subscriptionIDVal = req.params.subscriptionID;
    let subscriptionResultTransction = await _this.getSubscriptionWithSubscriptionID(subscriptionIDVal);

    if (subscriptionResultTransction.length > 0) {
      console.log('\n--> Submit Transaction: delete subscription');
      const response = await contract.submitTransaction('DeleteQueriesSubscription', subscriptionIDVal);
      console.log('*** Result: committed', JSON.parse(response));
      res.set({ "Status": "cline with subscription ID" + subscriptionIDVal + " is unsubscribed", });
      return res.status(204).send("Query deleted and clients disconnected");
    } else {
      return responseUtil.response404(res, "");
    }

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.onStreamSubscription = async (dataElement) => {
  while (true) {
    if (typeof contract == 'undefined') { await evaluateContract(); }
    if (typeof contract !== 'undefined') { break; }
    await sleep(1000); // Sleep for 1 second
  }
  //console.log("dataElement   :  ", dataElement)
  let collection = [];
  collection.push(dataElement);
  var queryString = {};
  queryString.docType = 'subscription';
  queryString.stream = true;
  let mangoQueryString = {};
  mangoQueryString.selector = queryString;
  mangoQueryString = JSON.stringify(mangoQueryString);
  let resultTransction = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
  resultTransction = JSON.parse(resultTransction);
  //console.log("resultTransction   :  ", resultTransction)
  if (resultTransction.length > 0) {
    let subscriptions = []
    for (const ind in resultTransction) {
      subscriptions.push(resultTransction[ind].Record);
    }
    while (subscriptions.length > 0) {
      const queryName = resultTransction[0].Record.queryName;
      let queryResult = await _this.getQueryWithQueryName(queryName)
      //console.log("queryResult.query   :  ", queryResult[0].Record.query)
      const queryString = await queryUtils.builedQueryString(queryResult[0].Record.query)
      //console.log("queryString   :  ", queryString)
      let cursor = mingo.find(collection, queryString)
      let events = [];
      for (let value of cursor) {
        events.push(value);
      }
      //console.log("events : ", events);
      if (events.length > 0) {
        for (let ii = 0; ii < subscriptions.length; ii++) {
          if (subscriptions[ii].queryName === queryName) {
            if (typeof subscriptions[ii].dest !== 'undefined') {
              console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
              sendSubscriptionWebHook(subscriptions[ii], events);
            } else {
              //ws implimentation
              console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
              WebsocketController.sendStreamWebsocket(subscriptions[ii].subscriptionID, events)
            }
            subscriptions = subscriptions.filter(function (el) { return el.subscriptionID != subscriptions[ii].subscriptionID; });
          }
        }
      } else if (events.length == 0) {
        for (let ii = 0; ii < subscriptions.length; ii++) {
          if (subscriptions[ii].queryName === queryName) {
            if (subscriptions[ii].reportIfEmpty) {
              if (typeof subscriptions[ii].dest !== 'undefined') {
                console.log("surving empty subscription with id: ", subscriptions[ii].subscriptionID);
                sendSubscriptionWebHook(subscriptions[ii], events);
              } else {
                //ws implimentation
                console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
                WebsocketController.sendStreamWebsocket(subscriptions[ii].subscriptionID, events)
              }
            }
            subscriptions = subscriptions.filter(function (el) { return el.subscriptionID != subscriptions[ii].subscriptionID; });
          }
        }
      }

    }


  }


  return;
  var subscriptions = await subscriptionModel.find({ stream: true });
  //console.log("subscriptions--",subscriptions);
  if (subscriptions.length > 0) {
    await eventsInMemoryModel.insertMany(dataElement);
    while (subscriptions.length > 0) {
      const queryName = subscriptions[0].queryName;
      const queries = await queriesModel.find({ name: queryName });
      //console.log(queries);
      const queryString = await queryUtils.builedQueryString(queries[0].query)
      //console.log("queryString : ", queryString)
      const events = await eventsInMemoryModel.find(queryString);
      var subscription_indexs = [];
      if (events.length > 0) {
        for (let ii = 0; ii < subscriptions.length; ii++) {
          if (subscriptions[ii].queryName === queryName) {
            if (typeof subscriptions[ii].dest !== 'undefined') {
              console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
              sendSubscriptionWebHook(subscriptions[ii], events);
            } else {
              //ws implimentation
              console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
              WebsocketController.sendStreamWebsocket(subscriptions[ii].subscriptionID, events)
            }
            subscriptions = subscriptions.filter(function (el) { return el.subscriptionID != subscriptions[ii].subscriptionID; });
          }
        }
      } else if (events.length == 0) {
        for (let ii = 0; ii < subscriptions.length; ii++) {
          if (subscriptions[ii].queryName === queryName) {
            if (subscriptions[ii].reportIfEmpty) {
              if (typeof subscriptions[ii].dest !== 'undefined') {
                console.log("surving empty subscription with id: ", subscriptions[ii].subscriptionID);
                sendSubscriptionWebHook(subscriptions[ii], events);
              } else {
                //ws implimentation
                console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
                WebsocketController.sendStreamWebsocket(subscriptions[ii].subscriptionID, events)
              }
            }
            subscriptions = subscriptions.filter(function (el) { return el.subscriptionID != subscriptions[ii].subscriptionID; });
          }
        }
      }

    }
    await eventsInMemoryModel.deleteMany({});
  }


}


exports.onStreamSubscription_original = async (dataElement) => {

  var subscriptions = await subscriptionModel.find({ stream: true });
  //console.log("subscriptions--",subscriptions);
  if (subscriptions.length > 0) {
    await eventsInMemoryModel.insertMany(dataElement);
    while (subscriptions.length > 0) {
      const queryName = subscriptions[0].queryName;
      const queries = await queriesModel.find({ name: queryName });
      //console.log(queries);
      const queryString = await queryUtils.builedQueryString(queries[0].query)
      //console.log("queryString : ", queryString)
      const events = await eventsInMemoryModel.find(queryString);
      var subscription_indexs = [];
      if (events.length > 0) {
        for (let ii = 0; ii < subscriptions.length; ii++) {
          if (subscriptions[ii].queryName === queryName) {
            if (typeof subscriptions[ii].dest !== 'undefined') {
              console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
              sendSubscriptionWebHook(subscriptions[ii], events);
            } else {
              //ws implimentation
              console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
              WebsocketController.sendStreamWebsocket(subscriptions[ii].subscriptionID, events)
            }
            subscriptions = subscriptions.filter(function (el) { return el.subscriptionID != subscriptions[ii].subscriptionID; });
          }
        }
      } else if (events.length == 0) {
        for (let ii = 0; ii < subscriptions.length; ii++) {
          if (subscriptions[ii].queryName === queryName) {
            if (subscriptions[ii].reportIfEmpty) {
              if (typeof subscriptions[ii].dest !== 'undefined') {
                console.log("surving empty subscription with id: ", subscriptions[ii].subscriptionID);
                sendSubscriptionWebHook(subscriptions[ii], events);
              } else {
                //ws implimentation
                console.log("surving subscription with id: ", subscriptions[ii].subscriptionID);
                WebsocketController.sendStreamWebsocket(subscriptions[ii].subscriptionID, events)
              }
            }
            subscriptions = subscriptions.filter(function (el) { return el.subscriptionID != subscriptions[ii].subscriptionID; });
          }
        }
      }

    }
    await eventsInMemoryModel.deleteMany({});
  }


}

function filterByID(item) {
  if (Number.isFinite(item.id) && item.id !== 0) {
    return true;
  }
  invalidEntries++;
  return false;
}

//this.onStreamSubscription();