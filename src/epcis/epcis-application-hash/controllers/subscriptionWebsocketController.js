var cron = require('node-cron');
var url = require('url');
const { v4: uuidv4 } = require('uuid');
const subscriptionController = require("./subscriptionsController")
//const subscriptionModel = require("../models/Subscription");
//const queriesModel = require("../models/Queries");
const queryUtils = require("../utils/queryUtils");
const queryPar = require("../config/queryConfig.js")
//const eventsModel = require("../models/Events.js");
const responseObj = require("../models/response.js");
const { getContract } = require('../utils/networkContractUtil.js');

let contract;
let gateway;
async function evaluateContract() { [contract, gateway] = await getContract(); }
evaluateContract();

exports.handleWebSocketRequest = async (ws, request) => {
    console.log('Clinet connected to Websocket');
    //console.log('Client connected from', request.url);
    var subscription = {};
    subscription.createdAt = new Date().toJSON();
    subscription.subscriptionID = uuidv4()
    ws.send('subscriptionID :' + subscription.subscriptionID);
    subscription.reportIfEmpty = false;
    subscription.minRecordTime = new Date().toJSON();
    subscription['GS1-EPC-Format'] = "Always_GS1_Digital_Link";

    //console.log('url.parse(request.url, true)', url.parse(request.url, true));
    var queryString = url.parse(request.url, true).query;
    var pathname = url.parse(request.url, true).pathname;
    const pathnames = pathname.split('/');
    //console.log('Cpathnames', pathnames);
    if ((pathnames.length === 4)) {
        if (pathnames[1] === 'queries' && pathnames[3] === 'events') {
            subscription.queryName = pathnames[2];
        } else {
            ws.send("path paramters exceptions ");
            ws.close();
        }
    } else {
        ws.send("path paramters exceptions : ");
        ws.close();
    }
    var second = ' * ';
    var minute = ' * ';
    var hour = ' * ';
    var dayOfMonth = ' * ';
    var month = ' * ';
    var dayOfWeek = ' * ';
    console.log(queryString);

    var scheduled_job;
    if (typeof queryString.minRecordTime !== 'undefined') { subscription.minRecordTime = queryString.minRecordTime }
    if (typeof queryString.reportIfEmpty !== 'undefined') { subscription.reportIfEmpty = queryString.reportIfEmpty }

    if (typeof queryString.stream !== 'undefined') {
        //console.log('From stream subscription: ' , subscription);
        subscription.stream = JSON.parse(queryString.stream);
        subscriptionController.saveSubscription(subscription);
        ws.subscription = subscription;
    } else if ((typeof queryString.second !== 'undefined') || (typeof queryString.dayOfWeek !== 'undefined') ||
        (typeof queryString.minute !== 'undefined') || (typeof queryString.hour !== 'undefined') ||
        (typeof queryString.dayOfMonth !== 'undefined') || (typeof queryString.month !== 'undefined')) {

        subscription.schedule = url.parse(request.url, false).query;

        if (typeof queryString.second !== 'undefined') { second = ' ' + queryString.second + ' ' }
        if (typeof queryString.minute !== 'undefined') { minute = ' ' + queryString.minute + ' ' }
        if (typeof queryString.hour !== 'undefined') { hour = ' ' + queryString.hour + ' ' }
        if (typeof queryString.dayOfMonth !== 'undefined') { dayOfMonth = ' ' + queryString.dayOfMonth + ' ' }
        if (typeof queryString.month !== 'undefined') { month = ' ' + queryString.month + ' ' }
        if (typeof queryString.dayOfWeek !== 'undefined') { dayOfWeek = ' ' + queryString.dayOfWeek + ' ' }
        let sh_time = second + minute + hour + dayOfMonth + month + dayOfWeek;
        console.log('Schedule Time : ', sh_time);
        ws.subscription = subscription;
        var valid = cron.validate(sh_time);
        if (!valid) {
            ws.send("Schedule is not valid");
            ws.close();
        }
        await subscriptionController.saveSubscription(subscription);

        scheduled_job = cron.schedule(sh_time, () => {
            serveSubscription(ws)
            //console.log('Message sent to clinet' + sh_time);
            //ws.send("sending " + sh_time);
        });
    } else {
        ws.send("query paramters exceptions 123");
        ws.close();
    }
    ws.on('close', async function () {
        if (typeof scheduled_job !== 'undefined') { scheduled_job.stop(); }
        try {
            if (typeof contract == 'undefined') {
                await evaluateContract();
            }
            console.log('\n--> Submit Transaction: delete subscription');
            const response = await contract.submitTransaction('DeleteQueriesSubscription', subscription.subscriptionID);
            console.log('*** Result: committed', JSON.parse(response));
        } catch (error) {
            console.log(error); // Failure
        }
    });
    ws.on('message', function incoming(message) {
        console.log('received: %s', message)
    });
};


async function serveSubscription(ws) {
    console.log("ws.subscription");
    const subscriptions = await subscriptionController.getSubscriptionWithSubscriptionID(ws.subscription.subscriptionID);
    //const subscriptions = await subscriptionModel.find({ subscriptionID: _subscriptionID, schedule: { $exists: true } }, { _id: 0 });
    if (subscriptions.length > 0) {
        const queries = await subscriptionController.getQueryWithQueryName(subscriptions[0].Record.queryName);
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
            if (typeof contract == 'undefined') {
                await evaluateContract();
            }
            let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, eventLimit.toString(), "");
            let resultFabric = JSON.parse(resultTransction)
            if (typeof resultFabric.results !== undefined) {
                if (resultFabric.results.length > 0) {
                    let eventData = [];
                    for (const evn in resultFabric.results) {
                        eventData.push(resultFabric.results[evn].Record)
                    }
                    webScoketSubSend(ws, ws.subscription.subscriptionID, eventData);
                } else if (resultFabric.results.length == 0) {
                    if (subscriptions[0].reportIfEmpty) {
                        webScoketSubSend(ws, ws.subscription.subscriptionID, []);
                    }
                }
            }
        }
    }
}

var wss;
exports.getWebscoket = (wss_) => {
    console.log("getWebscoket called ")
    wss = wss_;
}

function webScoketSubSend(ws, _subscriptionID, eventData) {
    result = responseObj.responseOb;
    //console.log()
    result.creationDate = new Date().toJSON();
    result.epcisBody.queryResults.resultBody.eventList = eventData;
    let subscription = ws.subscription;
    subscription.lastNotifiedAt = new Date().toJSON();
    subscription.minRecordTime = new Date().toJSON()
    subscriptionController.saveSubscription(subscription);
    //subscriptionModel.updateOne({ subscriptionID: _subscriptionID }, { $set: { lastNotifiedAt: new Date().toJSON(), minRecordTime: new Date().toJSON() } }, function (err, subscriptions) {
    //    if (err) { console.log("error updating lastNotifiedAt") }
    //});
    ws.send(JSON.stringify(result));
}

exports.sendStreamWebsocket = (_subscriptionID, eventData) => {
    //console.log("wss.clients : " , wss.clients)
    try {
        wss.clients.forEach(function each(client) {
            if (typeof client.subscription !== 'undefined') {
                if (client.subscription.subscriptionID === _subscriptionID) {
                    webScoketSubSend(client, _subscriptionID, eventData);
                }
            }
        });
    } catch (error) {
        console.log(error)
    }
}