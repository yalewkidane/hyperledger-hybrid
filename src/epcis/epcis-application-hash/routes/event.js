const express = require("express");
const router = express.Router();

const event_controller = require("../controllers/eventController.js");

router.post("/events", event_controller.eventPost);

//router.post("/events/blocktest", event_controller.blockChainTest);
router.post("/events/blocktest", event_controller.blockChainHashTest);


module.exports = router;



// eventPost   eventGet eventsGetEvId

