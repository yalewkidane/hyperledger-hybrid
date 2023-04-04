const express = require('express');
//const mongoose = require("mongoose")
//const conn_utils = require("./utils/connectionUtils.js")
const responseUtils = require("./utils/responseUtils");
const jwt = require('jsonwebtoken');

//To call all configuration files 
require('dotenv').config({ path: "./config/.env" })

const userdb=require('./utils/userDBInit')


/*
//const websocketController = require("./controllers/subscriptionWebsocketController");
const server = require('http').createServer(express_app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server });//, path: "/queries/{{queryName}}/events"
*/


var express_app = express();


const bcrypt = require('bcrypt');

//const User = require('./models/User');




const userController = require("./controllers/userController");

let PORT = 8090;





// Middleware function for verifying JWT token
const verifyToken = (req, res, next) => {
  // Get the JWT token from the request headers

  const token = req.headers.authorization?.split(' ')[0];

  // If the token is missing or invalid, send a 401 Unauthorized response
  if (!token) {
    responseUtils.response401(res, 'Missing or invalid token')
    //res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      responseUtils.response401(res, 'Invalid token')
      //res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Add the decoded token to the request object and continue to the next middleware
    req.decoded = decoded;
    //console.log(req.decoded);
    next();
  });
};


async function initUserDB() {
  await userdb.createUserDB();
  await userdb.createAdminIfNotExist();
}

initUserDB();




//express_app.use(verifyToken);
express_app.use((req, res, next) => {
  if (tokenFreePath(req.path)) {
    return next();
  }
  return verifyToken(req, res, next);
});

express_app.use(express.json());

//express_app.use("/test", test_router);

ROOT_END_POINT = process.env.ROOT_END_POINT
/*
express_app.use(ROOT_END_POINT, capture_router);
express_app.use(ROOT_END_POINT, info_router);
express_app.use(ROOT_END_POINT, event_router);
express_app.use(ROOT_END_POINT, eventTypes_router);
express_app.use(ROOT_END_POINT, epcs_router);
express_app.use(ROOT_END_POINT, bizSteps_router);
express_app.use(ROOT_END_POINT, bizLocations_router);
express_app.use(ROOT_END_POINT, readPoints_router);
express_app.use(ROOT_END_POINT, dispositions_router);
express_app.use(ROOT_END_POINT, queries_router);
express_app.use(ROOT_END_POINT, nextPageToken_router);
express_app.use(ROOT_END_POINT, vocabularies_router);


*/

//exports.getWebscoket=()=>{
//  return wss;
//}





// Login route
express_app.post('/login', (req, res) => { return userController.userLogin(req, res); });

// Register route
express_app.post('/register', (req, res) => { return userController.userRegister(req, res); });
express_app.get('/users', (req, res) => { return userController.userList(req, res); });
express_app.post('/approve', (req, res) => { return userController.userApprove(req, res); });
express_app.post('/update', (req, res) => { return userController.userUpdate(req, res); });
express_app.post('/delete', (req, res) => { return userController.userDelete(req, res); });





express_app.get('/hello', (req, res) => {
  res.send('Hello World!')
})

// Route that requires authentication
express_app.get('/protected', verifyToken, (req, res) => {
  res.send('Authenticated');
});


//express_app.use("/", index_router);
express_app.disable('x-powered-by');

/*
wss.on('connection', function connection(ws, request) {
  websocketController.getWebscoket(wss);
  websocketController.handleWebSocketRequest(ws, request);
});
*/

express_app.listen(PORT, () => {
  console.log("EPCIS Server Started");
  console.log("EPCIS Server running on port ", PORT);
  console.log("Send GET Request to", ROOT_END_POINT, " to get more information");
});




function tokenFreePath(path) {
  if ((path === '/hello')) {return true;}
  if ((path === '/login')) {return true;}
  if ((path === '/register')) {return true;}
  if ((path === '/users')) {return true;}
  if ((path === '/approve')) {return true;}
  if ((path === '/delete')) {return true;}
  if ((path === '/update')) {return true;}
  return false;
}


//May I have to clear or instantiate subscriptions here



//websocket 
//https://www.youtube.com/watch?v=wV-fDdHhGqs&t=311s