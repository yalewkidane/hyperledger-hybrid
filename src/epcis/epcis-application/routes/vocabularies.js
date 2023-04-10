const express = require("express");
const router = express.Router();

const vocabulary_controller = require("../controllers/vocabularyController.js");

router.get("/vocabularies", vocabulary_controller.vocabularyGet);



module.exports = router;


// eventPost   eventGet eventsGetEvId