const express = require("express");
const router = express.Router();


// respod to all methods and all the links if not address by the previous
router.all("*", function (req, res) {
    res.status(404).send("Please send a GET request to /epcis/v2 to see all the avalable services and endpoints")
    //res.redirect("/epcis/v2");
  });


module.exports = router;