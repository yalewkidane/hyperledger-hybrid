const express = require("express");
const router = express.Router();

const bizStepsController = require("../controllers/bizStepsController.js");

router.get("/bizSteps", bizStepsController.bizSteps);

router.get("/bizSteps/:bizStep", bizStepsController.bizStepsResource);

router.get("/bizSteps/:bizStep/events", bizStepsController.bizStepsEvent);


module.exports = router;


//eventTypes   eventTypeResource  eventTypeEvent