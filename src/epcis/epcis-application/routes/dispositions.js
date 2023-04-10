const express = require("express");
const router = express.Router();

const dispositionsController = require("../controllers/dispositionsController");

router.get("/dispositions", dispositionsController.dispositions);

router.get("/dispositions/:disposition", dispositionsController.dispositionsResource);

router.get("/dispositions/:disposition/events", dispositionsController.dispositionsEvent);


module.exports = router;


//eventTypes   eventTypeResource  eventTypeEvent