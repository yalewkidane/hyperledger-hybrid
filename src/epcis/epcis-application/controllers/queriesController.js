
const extensions = require("../config/extensions.js")
require('dotenv').config({ path: "./config/.env" })
const checker = require("../utils/checkUtils.js");
const responseUtil = require("../utils/responseUtils.js");
const queryValidate = require("../validators/queryValidator");

const subscriptions_controller = require("../controllers/subscriptionsController");
//const subscriptionModel = require("../models/Subscription");
const queryUtility = require("../utils/queryUtils");


const { getContract } = require('../utils/networkContractUtil.js');

let contract;
let gateway;
async function evaluateContract() { [contract, gateway] = await getContract(); }
evaluateContract();



async function getQueryWithQueryName(queryName) {
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


exports.queriesOptions = async (req, res) => {
  try {
    res.status(200).send("Under constraction")

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};

exports.queriesGet = async (req, res) => {
  try {

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });

    //Checking Headers
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError)
    }
    var responseLimit = 30;
    var queryString = {}

    if (req.query.PerPage) {
      responseLimit = req.query.PerPage;
    }
    if (typeof contract == 'undefined') {
      await evaluateContract();
    }

    let bookmark = ''
    //console.log("queryString : ", queryString);
    if (typeof req.query.nextPageToken !== 'undefined') {
      const token = req.query.nextPageToken.replace('rel="next"', '');
      bookmark = token;
      //obj._id=parameters.NextPageToken;
    }
    queryString.docType = 'queries'
    let mangoQueryString = {};
    mangoQueryString.selector = queryString;
    mangoQueryString = JSON.stringify(mangoQueryString)
    //console.log("mangoQueryString : ", mangoQueryString);
    let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, responseLimit.toString(), bookmark);
    let resultFabric = JSON.parse(resultTransction)
    //console.log("resultFabric : ", resultFabric);
    if (typeof resultFabric.results !== undefined) {
      if (resultFabric.results.length > 0) {
        let queries = [];
        resultFabric.results.forEach(resul => {
          queries.push(resul.Record)
        });
        for (const ind in queries) {
          delete queries[ind].docType;
        }

        const next = resultFabric.bookmark;
        var Link = process.env.ROOT_END_POINT + "/queries?perPage=" + responseLimit +
          "&nextPageToken=" + next;
        if (queries.length >= responseLimit) {
          Link = Link + 'rel="next"';
        }
        res.set({ "Link": Link });
        res.set({ "GS1-Next-Page-Token-Expires": "NA" });
        return res.status(200).json(queries);

      }
      return res.status(200).json([]);
    }
  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};

exports.queriesPost = async (req, res) => {
  try {
    //check headers
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError)
    }

    //check if name exist
    if (typeof req.body.name === 'undefined') {
      return responseUtil.response400(res, "UniqueQueryName is MUST!");
    }
    //check if query exist
    if (typeof req.body.query === 'undefined') {
      return responseUtil.response400(res, "Body should contain query");
    }
    //validate the query string
    const [valStatus, valEror] = queryValidate.queryValidate(req.body.query);
    if (!valStatus) {
      return responseUtil.response400(res, valEror);
    }

    if (typeof contract == 'undefined') {
      await evaluateContract();
    }
    let queries = req.body;
    queries.docType = 'queries';
    let resultTransction = await getQueryWithQueryName(queries.name);

    //console.log("resultTransction : ", resultTransction);
    //console.log("resultTransction.length : ", resultTransction.length);
    if (resultTransction.length > 0) {
      return responseUtil.response400(res, "Query Name already exist; Use a different unique query name");
    } else {

      console.log('\n--> Submit Transaction: Queries');
      const response = await contract.submitTransaction('CaptureQueriesData', JSON.stringify(queries));
      console.log('*** Result: committed', JSON.parse(response));

      res.set({
        "GS1-EPCIS-Version": "2.0",
        "GS1-CBV-Version": "2.0",
        "GS1-Extensions": [''],
        "Location": process.env.ROOT_END_POINT + '/queries/' + req.body.name
      });
      return res.status(201).send('Named Query Created');
    }
  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};




exports.queriesQueryNameGet = async (req, res) => {
  try {

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });

    //Checking Headers
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError)
    }
    const queryName = req.params.queryName;

    let resultTransction = await getQueryWithQueryName(queryName);

    if (resultTransction.length > 0) {
      console.log("resultTransction : ", resultTransction);
      delete resultTransction[0].Record.docType;
      return res.status(200).json(resultTransction[0].Record);
    } else {
      return responseUtil.response404(res);
    }
  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};

exports.queriesQueryNameEventGet = async (req, res) => {
  try {

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });

    //Checking Headers
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError)
    }
    const queryName = req.params.queryName;
    console.log("queryName : ", queryName);
    let resultTransction = await getQueryWithQueryName(queryName);

    if (resultTransction.length > 0) {
        console.log("resultTransction : ", resultTransction);
        console.log("query : ", resultTransction[0].Record.query);
        queryUtility.getQueryResultByQueryName(req, res, resultTransction[0].Record.query)
    }else {
      return responseUtil.response404(res, "");
    }

    return
    queriesModel.find({ name: queryName }, { _id: 0 }, function (err, resources) {
      if (err) {
        console.log(err);
        responseUtil.response500(res, err);
      } if (resources) {
        if (resources.length > 0) {
          console.log("queryName : ", resources[0].query);
          queryUtility.getQueryResultByQueryName(req, res, resources[0].query)
          //return res.status(200).json(resources[0]);
        } else {
          return responseUtil.response404(res, "");
        }
      }

    });

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};


exports.queriesQueryNameDelete = async (req, res) => {
  try {

    const queryNameVal = req.params.queryName;
    let queryResultTransction = await getQueryWithQueryName(queryNameVal);

    if (queryResultTransction.length > 0) {
      console.log("resultTransction : ", queryResultTransction);
      console.log('\n--> Submit Transaction: delete queries');
      const response = await contract.submitTransaction('DeleteQueriesSubscription', queryResultTransction[0].Key);
      console.log('*** Result: committed', JSON.parse(response));
      var queryString = {};
      queryString.docType = 'subscription';
      let mangoQueryString = {};
      mangoQueryString.selector = queryString;
      mangoQueryString = JSON.stringify(mangoQueryString)
      let resultTransction = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
      resultTransction = JSON.parse(resultTransction);
      //console.log("resultTransction : ", resultTransction);
      if (resultTransction.length > 0) {
        for(const ind in resultTransction){
          const subscriptionID = resultTransction[ind].Record.subscriptionID;
          subscriptions_controller.stopSchduleSubscription(subscriptionID);
          console.log('\n--> Submit Transaction: delete subscriptions');
          const response = await contract.submitTransaction('DeleteQueriesSubscription', subscriptionID);
          console.log('*** Result: committed', JSON.parse(response));
        }
      }
      res.set({ "Status": "Query deleted and clients disconnected", });
      return res.status(204).send("Query deleted and clients disconnected");
    } else {
      return responseUtil.response404(res, "");
    }

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }
};
