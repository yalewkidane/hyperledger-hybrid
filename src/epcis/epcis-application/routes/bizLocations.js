const express = require("express");
const router = express.Router();

const bizLocationsController = require("../controllers/bizLocationsController");

router.get("/bizLocations", bizLocationsController.bizLocations);

router.get("/bizLocations/:bizLocation", bizLocationsController.bizLocationsResource);

router.get("/bizLocations/:bizLocation/events", bizLocationsController.bizLocationsEvent);


module.exports = router;


//eventTypes   eventTypeResource  eventTypeEvent