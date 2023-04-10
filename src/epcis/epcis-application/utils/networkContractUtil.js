const networkcontract = require("../networkContract");


let contract;
let gateway;

global.initContractStatus=false;

async function getContractandGateway() {
  console.log("--------=====================++++++++++++++++");
  console.log("global.initContractStatus ", global.initContractStatus);
  global.initContractStatus=true;
  [contract, gateway] = await networkcontract.getcontractGateway();
  console.log("typeof contract ", typeof contract);
  console.log("typeof gateway ", typeof gateway);
  //cacheVariables.contractStatus=true
  console.log("+++++++=====================++++++++++++++++");
}

async function init() {
  if (!global.initContractStatus) {
    await getContractandGateway();
  }
}

exports.getContract = async () => {
  await init();
  return [contract, gateway];
};