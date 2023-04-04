
'use strict';
const networkcontract = require('./networkContract');
const express = require('express')
const app = express()
const port = 3000

const userdb=require('./utils/userDBInit')

const nano = require('nano')('http://admin:adminpw@localhost:5984');

async function initUserDB() {
  await userdb.createUserDB();
  await userdb.createAdminIfNotExist();
}

initUserDB();



async function creatDB(dbName) {
    return new Promise((resolve, reject) => {
      nano.db.create(dbName, (err, body) => {
        if (err) {
          if (err.statusCode === 412) { // If the database already exists, ignore the error
            console.log(`Database ${dbName} already exists.`);
            resolve();
          } else {
            reject(new Error(`Error creating database ${dbName}: ${err.message}`));
          }
        } else {
          console.log(`Database ${dbName} created successfully.`);
          resolve();
        }
      });
    });
  }
  
  async function insertDB(db, newDoc) {
    return new Promise((resolve, reject) => {
      db.insert(newDoc, (err, body) => {
        if (err) {
          reject(new Error(`Error inserting document: ${err.message}`));
        } else {
          console.log(`Document inserted with ID ${body.id}`);
          resolve();
        }
      });
    });
  }
  
  async function getAlldoc(db, dbName) {
    return new Promise((resolve, reject) => {
      db.list({ include_docs: true }, (err, body) => {
        if (err) {
          reject(new Error(`Error reading database ${dbName}: ${err.message}`));
        } else {
          console.log(`Found ${body.rows.length} documents in database ${dbName}:`);
          body.rows.forEach(row => {
            console.log(row.doc);
          });
          resolve();
        }
      });
    });
  }


async function testcouch(){

    const dbName = 'userdb'; // Replace with the name of your database
    const userdb = nano.db.use(dbName);

    const newDoc = {
        name: 'John Doe',
        age: 35,
        email: 'johndoe@example.com'
      };

    await creatDB(dbName);

    await insertDB(userdb, newDoc);

    await getAlldoc(userdb,dbName);


}

async function caller(){
    await testcouch();
}



function deletedb(){
    const dbName = 'userdb'; // Replace with the name of your database
    //const userdb = nano.db.use(dbName);
    nano.db.destroy(dbName, function(err, body) {
        if (err) {
          console.log(`Error deleting database ${dbName}: ${err.message}`);
        } else {
          console.log(`Database ${dbName} deleted successfully.`);
        }
      });
}
//caller();
//deletedb();



require('dotenv').config({ path: "./config/.env" })
console.log(process.env.CouchDB_URL)

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function test_app(contract, gateway) {
    try {
        try {
            let result;
            console.log('\n--> Evaluate Transaction: GetAssetsByRange, function returns assets in a specific range from asset1 to before asset6');
            result = await contract.evaluateTransaction('GetAssetsByRange', 'asset1', 'asset6');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);
        } finally {
            //const gateway = contract.getGateway();
            //gateway.disconnect();
            gateway.disconnect();
        }
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}



let contract;
let gateway;

async function getContractandGateway() {
    [contract, gateway] = await networkcontract.connectToContract();
    //test_app(contract, gateway);
    //return [contract, gateway];
}


getContractandGateway();




app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.get('/asset', async (req, res) => {
    try {
        console.log('\n--> Evaluate Transaction: GetAssetsByRange, function returns assets in a specific range from asset1 to before asset6');
        let result = await contract.evaluateTransaction('GetAssetsByRange', 'asset1', 'asset6');
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);
        return res.json(JSON.parse(result))
    } catch (error) {
        return res.send(error)
    }

})

app.get('/close', (req, res) => {
    try {
        gateway.disconnect();
        return res.send("closed successfully")
    } catch (error) {
        return res.send(error)
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



