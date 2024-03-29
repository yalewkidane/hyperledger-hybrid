

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../../../test-application/javascript/AppUtil');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');
const channelName = 'mychannel';
const chaincodeName = 'ledger';
const mspOrg1 = 'Org1MSP';

const walletPath = path.join(__dirname, 'wallet');
const userId = 'appUser';

const RED = '\x1b[31m\n';
const GREEN = '\x1b[32m\n';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const subscription = require("./controllers/subscriptionsController.js");
const queryConfig = require("./config/queryConfig.js")
async function connectToContract() {

  // build an in memory object with the network configuration (also known as a connection profile)
  const ccp = buildCCPOrg1();

  // build an instance of the fabric ca services client based on
  // the information in the network configuration
  const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

  // setup the wallet to hold the credentials of the application user
  const wallet = await buildWallet(Wallets, walletPath);

  // in a real application this would be done on an administrative flow, and only once
  await enrollAdmin(caClient, wallet, mspOrg1);

  // in a real application this would be done only when a new user was required to be added
  // and would be part of an administrative flow
  await registerAndEnrollUser(caClient, wallet, mspOrg1, userId, 'org1.department1');

  // Create a new gateway instance for interacting with the fabric network.
  // In a real application this would be done as the backend server session is setup for
  // a user that has been verified.
  const gateway = new Gateway();


  // setup the gateway instance
  // The user will now be able to create connections to the fabric network and be able to
  // submit transactions and query. All transactions submitted by this gateway will be
  // signed by this user using the credentials stored in the wallet.
  await gateway.connect(ccp, {
    wallet,
    identity: userId,
    discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
    //eventHandlerOptions: EventStrategies.NONE
    options: {
      // Default timeouts for different gRPC calls 
      requestTimeout: 100000, // In milliseconds
      proposalTimeout: 100000, // In milliseconds
      transactionTimeout: 100000, // In milliseconds
      eventHandlerOptions: {
        strategy: EventStrategies.NONE,
        endorseTimeout: 100000,
        timeout: 100000 // In milliseconds
      }
    }
  });

  // Build a network instance based on the channel where the smart contract is deployed
  const network = await gateway.getNetwork(channelName);

  // Get the contract from the network.
  const contract = network.getContract(chaincodeName);

  if (queryConfig.SubscriptionStatus) {
    let listener = async (event) => {
      const eventObj = JSON.parse(event.payload.toString());
      console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${JSON.stringify(eventObj)}${RESET}`);
      subscription.onStreamSubscription(eventObj);
    };
    // now start the client side event service and register the listener
    console.log(`${GREEN}--> Start contract event stream to peer in Org1${RESET}`);
    await contract.addContractListener(listener);
  }


  return [contract, gateway];

}



//module.exports = {connectToContract};

exports.getcontractGateway = async () => {
  return await connectToContract();
}

