const express = require("express");
const router = express.Router();

const epcsController = require("../controllers/epcsController");

router.get("/epcs", epcsController.epcs);

router.get("/epcs/:epc", epcsController.epcsResource);

router.get("/epcs/:epc/events", epcsController.epcsEvent);


module.exports = router;


//eventTypes   eventTypeResource  eventTypeEvent