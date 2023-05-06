const couch = require('./couchdbConnection');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.createUserDB = async () => {
  try {
    // check if the database already exists
    const dbs = await couch.listDatabases();
    if (dbs.includes(process.env.COUCHDB_USERDB)) {
      console.log('Database already exists');
    } else {
      // create a new database if it doesn't exist
      await couch.createDatabase(process.env.COUCHDB_USERDB);
      console.log('Database created successfully');
    }
    // the rest of your code goes here
    // ...
  } catch (error) {
    console.error('Error creating database');
  }
}

const userdb = process.env.COUCHDB_USERDB;


exports.createAdminIfNotExist = async () => {

  const mangoQuery = {
    selector: {
      role: 'admin'
    },
    limit: 1
  };
  couch.mango(userdb, mangoQuery).then(({ data, headers, status }) => {
    // data is json response
    // headers is an object with all response headers
    // status is statusCode number
    if (data.docs.length == 0) {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync('admin', salt);

      const adminUser = {
        usrname: 'admin',
        pwd: hashedPassword,
        eml: 'admin@example.com',
        role: 'admin',
        status: 'approved'
      };

      couch.insert(userdb, adminUser)
        .then(() => console.log('User registered successfully'))
        .catch(error => console.error('Error registering user', error));
    } else {
      console.log('Admin already existes')
    }


  }, err => {
    console.log("error  ", err);
    // either request error occured
    // ...or err.code=EDOCMISSING if document is missing
    // ...or err.code=EUNKNOWN if statusCode is unexpected
  });
}



exports.genereteRandomeNumber = ()=>{
  const randomKey = crypto.randomBytes(32).toString('hex');
  console.log(randomKey);
}
