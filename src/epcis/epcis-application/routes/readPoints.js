const express = require("express");
const router = express.Router();

const readPointsController = require("../controllers/readPointsController");

router.get("/readPoints", readPointsController.readPoints);

router.get("/readPoints/:readPoint", readPointsController.readPointsResource);

router.get("/readPoints/:readPoint/events", readPointsController.readPointssEvent);


module.exports = router;


//eventTypes   eventTypeResource  eventTypeEvent