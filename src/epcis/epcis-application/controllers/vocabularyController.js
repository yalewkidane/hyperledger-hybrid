
const extensions = require("../config/extensions.js")
require('dotenv').config({ path: "./config/.env" })

const checker = require("../utils/checkUtils.js");
const responseUtil = require("../utils/responseUtils.js");
const responseObj = require("../models/response.js");

const { getContract } = require('../utils/networkContractUtil.js');


let contract;
let gateway;
async function evaluateContract() {
    [contract, gateway] = await getContract();
    console.log("ec typeof contract ", typeof contract);
    console.log("ec typeof gateway ", typeof gateway);
}

evaluateContract();

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

exports.vocabularyGet = async (req, res) => {
  try {

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });

    console.log(req.query)
    var masterDataLimit = 30;


    const notToBeParsed = ["nextPageToken", "vocabularyName", "HASATTR"];
    Object.keys(req.query).forEach(function (key) {
      if (!notToBeParsed.includes(key)) {
        req.query[key] = JSON.parse(req.query[key])
      }
    });

    //perPage
    if (typeof req.query.perPage !== 'undefined') {
      if (req.query.perPage > 50 || req.query.perPage < 0) {
        responseUtil.response406(res, "perpage should between 0 and 50");
      } else { masterDataLimit = req.query.perPage; }

    }

    let bookmark = ''
    //console.log("queryString : ", queryString);
    if (typeof req.query.nextPageToken !== 'undefined') {
      const token = req.query.nextPageToken.replace('rel="next"', '');
      bookmark = token;
      //obj._id=parameters.NextPageToken;
    }

    const [queryString, projection] = buidlMasterDataQueryString(req.query);

    queryString.docType = 'masterData';
    //{ "$match" : { "lookup_as_field_name.0" : { "$exists" : false } } }
    console.log("Projection : ", projection);
    console.log("queryString : ", queryString);

    let mangoQueryString = {};
    mangoQueryString.selector = queryString;
    //mangoQueryString.sort = sort;
    mangoQueryString = JSON.stringify(mangoQueryString)
    console.log("mangoQueryString : ", mangoQueryString);
    //let result2 = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);
    if (typeof contract == 'undefined') {
      await evaluateContract();
    }
    let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, masterDataLimit.toString(), bookmark);
    let resultFabric = JSON.parse(resultTransction)
    var resultMaster = responseObj.responseObMaster;
    if (typeof resultFabric.results !== undefined) {
      if (resultFabric.results.length > 0) {
        let vocabularies = []
        for (const voc in resultFabric.results) {
          vocabularies.push(resultFabric.results[voc].Record)
        }

        for (const voc in vocabularies) {
          for (const cont in vocabularies[voc].context) {
            contextAdder(resultMaster["@context"], cont, vocabularies[voc].context[cont], 1);
          }
        }

        for (const voc in vocabularies) {
          delete vocabularies[voc].context;
          delete vocabularies[voc].docType;
          delete vocabularies[voc]._id;
        }

        resultMaster.epcisBody.queryResults.resultBody.vocList = vocabularies;
        //queryResults.resultsBody = vocabularies;
        const next = vocabularies[vocabularies.length - 1]._id
        var Link = process.env.ROOT_END_POINT + "/vocabularies?perPage=" + masterDataLimit +
          "&nextPageToken=" + next;
        if (vocabularies.length >= masterDataLimit) {
          Link = Link + 'rel="next"';
        }
        res.set({ "Link": Link });
        res.set({ "GS1-Next-Page-Token-Expires": "NA" });

      }
    }

    return res.status(200).json(resultMaster);


  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};


function buidlMasterDataQueryString(parameters) {
  var queryString = {};
  var projection = { __v: 0 };


  /* //nextPageToken
  if (typeof parameters.nextPageToken !== 'undefined') {
    const token = parameters.nextPageToken.replace('rel="next"', '')
    queryString._id = { $lt: token }
    //obj._id=parameters.NextPageToken;
  }
  */

  //vocabularyName
  if (typeof parameters.vocabularyName !== 'undefined') {
    queryString.type = parameters.vocabularyName;
  }

  //includeAttributes
  if (typeof parameters.includeAttributes !== 'undefined') {
    if (!parameters.includeAttributes) {
      projection.attributes = 0;
    }
  }
  //includeChildren
  if (typeof parameters.includeChildren !== 'undefined') {
    if (!req.query.includeChildren) {
      projection.children = 0;
    }
  }
  //attributeNames
  //if (typeof parameters.vocabularyName !== 'undefined') {
  //  queryString.type = parameters.vocabularyName;
  //}

  //HASATTR
  if (typeof parameters.HASATTR !== 'undefined') {
    queryString['attributes.id'] = parameters.HASATTR;
  }

  return [queryString, projection];
}

