
const extensions = require("../config/extensions.js")
require('dotenv').config({ path: "./config/.env" })

const checker = require("../utils/checkUtils.js");
const responseUtil = require("../utils/responseUtils.js");
const queryUtilis = require("../utils/queryUtils.js");

const { getContract } = require('../utils/networkContractUtil.js');
let contract;
let gateway;
async function evaluateContract() {[contract, gateway] = await getContract();}
evaluateContract();

exports.bizSteps = async (req, res) => {



  try {

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });

    //console.log(req.headers) 
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
    queryString.docType = 'bizStep'
    let mangoQueryString = {};
    mangoQueryString.selector = queryString;
    //mangoQueryString.sort = sort;
    mangoQueryString = JSON.stringify(mangoQueryString)
    console.log("mangoQueryString : ", mangoQueryString);
    //let result2 = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);

    let resultTransction = await contract.evaluateTransaction('QueryEPCISWithPagination', mangoQueryString, responseLimit.toString(), bookmark);

    let resultFabric = JSON.parse(resultTransction)
    if (typeof resultFabric.results !== undefined) {
      var responseContext = [];
      var responseType = "Collection";
      var responseMember = [];
      if (resultFabric.results.length > 0) {
        console.log(resultFabric.results.length, " bizSteps returned");
        responseContext.push("https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld");

        let conExt = {};
        resultFabric.results.forEach(resul => {
          const element = resul.Record;
          if (Object.keys(element.context).length > 0) {
            conExt = { ...conExt, ...element.context };
          }
          if (element.voc) {
            responseMember.push(element.voc)
          }
        });
        responseContext.push(conExt);

        const next = resultFabric.bookmark;
        var Link = process.env.ROOT_END_POINT + "/bizSteps?perPage=" + responseLimit +
          "&nextPageToken=" + next;
        if (resultFabric.results.length >= responseLimit) {
          Link = Link + 'rel="next"';
        }
        res.set({ "Link": Link });
        res.set({ "GS1-Next-Page-Token-Expires": "NA" });

      }
      return res.status(200).json({
        "@context": responseContext,
        "type": responseType,
        "member": responseMember
      });
    }

  } catch (error) {
    console.log(error)
    responseUtil.response500(res, error);
  }

};





exports.bizStepsResource = async (req, res) => {
  try {

    res.set({
      "GS1-EPCIS-Version": "2.0",
      "GS1-CBV-Version": "2.0",
      "GS1-Extensions": ['']
    });

    const bizStepVal = req.params.bizStep;
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(req.headers)
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError);
    }

    if (typeof contract == 'undefined') {
      await evaluateContract();
    }

    var queryString = {}
    queryString.docType = 'bizStep';
    queryString.voc = bizStepVal;
    let mangoQueryString = {};
    mangoQueryString.selector = queryString;
    //mangoQueryString.sort = sort;
    mangoQueryString = JSON.stringify(mangoQueryString)
    //console.log("mangoQueryString : ", mangoQueryString);
    //let result2 = await contract.evaluateTransaction('QueryEPCIS', mangoQueryString);

    let resultTransction = await contract.evaluateTransaction('VocExists', mangoQueryString);

    let resultFabric = JSON.parse(resultTransction)

    if (typeof resultFabric !== 'undefined') {
      if (resultFabric.length > 0) {

        if (Object.keys(resultFabric[0].Record.context).length > 0) {
          resCont = [];
          resCont.push("https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld");
          resCont.push(resultFabric[0].Record.context)
        }
        else {
          resCont = "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld";
        }
        return res.status(200).json({
          "@context": resCont,
          "type": "Collection",
          "member": [
            "events"
          ]
        });
      } else {
        responseUtil.response404(res);
      }
    } else {
      responseUtil.response404(res);
    }


  } catch (error) {
    console.log(error)
    responseUtil.response500(res, error);
  }

};



exports.bizStepsEvent = (req, res) => {
  if (req.query.EQ_bizStep) {
    return responseUtil.response400(res, "EQ_bizStep should not be included in the query parameters");
  }
  req.query.EQ_bizStep = '["' + req.params.bizStep + '"]';
  queryUtilis.getQueryResult(req, res);

};