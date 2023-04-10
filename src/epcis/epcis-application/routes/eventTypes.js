const express = require("express");
const router = express.Router();

const eventTypesController = require("../controllers/eventTypesController.js");

router.options("/eventTypes", eventTypesController.eventTypesOptions);
router.options("/eventTypes/:eventType", eventTypesController.eventTypeResourceOptions);

router.get("/eventTypes", eventTypesController.eventTypes);

router.get("/eventTypes/:eventType", eventTypesController.eventTypeResource);

router.get("/eventTypes/:eventType/events", eventTypesController.eventTypeEvent);


module.exports = router;


//eventTypes   eventTypeResource  eventTypeEvent