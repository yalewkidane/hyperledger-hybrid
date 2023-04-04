require('dotenv').config({ path: "./config/.env" })
const couch = require('../utils/couchdbConnection.js');
const userdb = process.env.COUCHDB_USERDB;

const responseUtil = require("../utils/responseUtils.js");


const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


async function findUser(username, password) {
  const query = {
    selector: { usrname: username, },
    fields: ["pwd", "status"]
  };
  const user = await couch.mango(userdb, query);
  if (user.status === 200 && user.data.docs.length > 0) {
    if (bcrypt.compareSync(password, user.data.docs[0].pwd)) {
      if (user.data.docs[0].status === "waiting") {
        return "waiting";
      } else { return "approved"; }
    } else { return "password" }
  } else { return "username"; }

}


async function findUsername(username) {
  const query = {
    selector: {usrname: username},
    fields: ["_id"],
    limit: 1
  };

  try {
    const result = await couch.mango(userdb, query);
    if (result.data.docs.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
  }

}

//Done
async function findAdmin(username, password) {
  const query = {
    selector: {
      usrname: username,
      role: 'admin'
    },
    fields: ["pwd"],
    limit: 1
  };
  const result = await couch.mango(userdb, query);
  if (result.data.docs.length > 0) {
    return bcrypt.compareSync(password, result.data.docs[0].pwd);
  } else {
    return false;
  }
}

//Done
exports.userLogin = async (req, res) => {

  try {
    const { username, password } = req.body;
    const stat = await findUser(username, password);

    if (stat === "username") { return res.status(401).json({ error: 'Invalid credentials, Incorect username' }); }
    if (stat === "password") { return res.status(401).json({ error: 'Invalid credentials, Incorect password' }); }
    if (stat === "waiting") { return res.status(401).json({ error: 'Invalid credentials, Approval is waiting' }); }

    if (stat === "approved") {
      const token = jwt.sign({ userId: username }, process.env.SECRET);
      return res.status(401).json({ token });
    }

  }
  catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};



/*
User can register by providing username, password and email

User first status will be waiting until approved by admin

*/

function getHashedPassword(password) {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
}

//Done
exports.userRegister = async (req, res) => {
  try {

    if (req.body.username === 'undefined') {
      return res.status(401).json({ error: 'Need to provide username' });
    }
    if (req.body.password === 'undefined') {
      return res.status(401).json({ error: 'Need to provide password' });
    }
    if (req.body.email === 'undefined') {
      return res.status(401).json({ error: 'Need to provide email' });

    }

    const userNameExist = await findUsername(req.body.username);

    if (userNameExist) {
      return res.status(401).json({ error: 'Username exist, use a different username' });
    }

    const hashedPassword = getHashedPassword(req.body.password);

    const normalUser = {
      usrname: req.body.username,
      pwd: hashedPassword,
      eml: req.body.email,
      role: 'user',
      status: 'waiting'
    };


    couch.insert(userdb, normalUser)
      .then(() => {
        console.log('User registered successfully');
        return res.status(202).json("User registered successfully need to for approval ");
      })
      .catch(error => {
        console.error('Error registering user', error);
        return res.status(500).send('Error registering user', error)
      });


  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};

//Done
exports.userUpdate = async (req, res) => {
  try {
    if (typeof req.body.username === 'undefined') {
      return res.status(401).json({ error: 'Need to provide username' });
    }
    if (typeof req.body.password === 'undefined') {
      return res.status(401).json({ error: 'Need to provide password' });
    }

    const stat = await findUser(req.body.username, req.body.password);


    if (stat === "username") { return res.status(401).json({ error: 'Invalid credentials, Incorect username' }); }
    if (stat === "password") { return res.status(401).json({ error: 'Invalid credentials, Incorect password' }); }
    if (stat === "waiting" || stat === "approved") {
      const query = { selector: { usrname: req.body.username }, }
      couch.mango(userdb, query).then(({ data, headers, status }) => {
        if (data.docs.length > 0) {
          let userTobeUpdated = data.docs[0];
          if (typeof req.body.newUsername !== "undefined") { userTobeUpdated.usrname = req.body.newUsername; }
          if (typeof req.body.newPassword !== 'undefined') {
            const hashedPassword = getHashedPassword(req.body.newPassword);
            userTobeUpdated.pwd = hashedPassword;
          }
          if (typeof req.body.newEmail !== 'undefined') { userTobeUpdated.eml = req.body.newEmail }

          couch.update(userdb, userTobeUpdated).then(({ data, headers, status }) => {
            return res.status(203).json({ Status: 'user updated' });
          }, err => {
            console.error(err);
            return res.status(401).json({ error: 'error occurred' });
          });
        } else {
          return res.status(401).json({ error: 'no user found' });
        }
      }, err => {
        console.error(err);
        return res.status(401).json({ error: 'error occurred' });
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};

//done
exports.userApprove = async (req, res) => {
  try {


    if (typeof req.body.username === 'undefined') {
      return res.status(401).json({ error: 'Need to provide username' });
    }
    if (typeof req.body.password === 'undefined') {
      return res.status(401).json({ error: 'Need to provide password' });
    }
    if (typeof req.body.user === 'undefined') {
      return res.status(401).json({ error: 'Need to provide user username' });

    }


    const stat = await findAdmin(req.body.username, req.body.password)
    if (stat) {
      const query = {
        selector: { usrname: req.body.user },
        //fields: ["_id", "_rev"],
      };
      couch.mango(userdb, query).then(({ data, headers, status }) => {
        if (data.docs.length > 0) {
          let userTobeApproved = data.docs[0];
          userTobeApproved.status = 'approved';
          couch.update(userdb, userTobeApproved).then(({ data, headers, status }) => {
            //console.log(data);
            return res.status(203).json({ Status: 'user updated' });
          }, err => {
            console.error(err);
            return res.status(401).json({ error: 'error occurred' });
          });
        } else {
          return res.status(401).json({ error: 'no user found' });
        }
      }, err => {
        console.error(err);
        return res.status(401).json({ error: 'error occurred' });
      });

    }

  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};

//done
exports.userList = async (req, res) => {
  try {
    const query = {
      "selector": {
        "role": "user"
      },
      "fields": ["usrname", "eml", "role", "status"]
    };
    const result = await couch.mango(userdb, query);
    if (result) {
      res.status(200).json(result.data.docs);
    }

  } catch (error) {
    console.log(error)
    responseUtil.response500(res, error);
  }

};

//Done
exports.userDelete = async (req, res) => {
  try {

    if (req.body.username === 'undefined') {
      return res.status(401).json({ error: 'Need to provide username' });
    }
    if (req.body.password === 'undefined') {
      return res.status(401).json({ error: 'Need to provide password' });
    }
    if (req.body.user === 'undefined') {
      return res.status(401).json({ error: 'Need to provide user username' });
    }

    const stat = await findAdmin(req.body.username, req.body.password)
    if (stat) {
      const query = {
        selector: { usrname: req.body.user, },
        fields: ["_id", "_rev"],
      };
      couch.mango(userdb, query).then(({ data, headers, status }) => {
        if (data.docs.length > 0) {
          const user = data.docs[0];
          couch.del(userdb, user._id, user._rev).then(({ data, headers, status }) => {
            return res.status(203).json({ Status: 'user deleted' });
          }, err => {
            console.error(err)
            return res.status(401).json({ error: 'error occured ' });
          });
        } else {
          return res.status(401).json({ error: 'no user found' });
        }
      }, err => {
        console.error(err)
        return res.status(401).json({ error: 'error occured ' });
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' })
    }



  } catch (error) {
    console.log(String(error))
    responseUtil.response500(res, error);
  }

};