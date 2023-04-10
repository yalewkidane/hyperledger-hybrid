const express = require("express");
const router = express.Router();

const capture_controller = require("../controllers/captureController.js");

router.get("/capture", capture_controller.captureGet);

router.get("/capture/:captureID", capture_controller.captureGetId);


router.post("/capture", capture_controller.capture);


module.exports = router;