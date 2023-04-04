const NodeCouchDb = require('node-couchdb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });


const couch = new NodeCouchDb({
    auth: {
        user: process.env.COUCHDB_USER,
        pass: process.env.COUCHDB_PASS
    }
});

module.exports = couch;