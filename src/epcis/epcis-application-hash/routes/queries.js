const express = require("express");
const router = express.Router();

const query_controller = require("../controllers/queriesController");
const subscriptions_controller = require("../controllers/subscriptionsController");

router.options("/queries", query_controller.queriesOptions);

router.get("/queries", query_controller.queriesGet);

router.post("/queries", query_controller.queriesPost);

router.get("/queries/:queryName", query_controller.queriesQueryNameGet);

router.delete("/queries/:queryName", query_controller.queriesQueryNameDelete);

router.get("/queries/:queryName/events", query_controller.queriesQueryNameEventGet);

router.get("/queries/:queryName/subscriptions", subscriptions_controller.queryNameSubscriptionsGet);

router.post("/queries/:queryName/subscriptions", subscriptions_controller.queryNameSubscriptionsPost);

router.get("/queries/:queryName/subscriptions/:subscriptionID", subscriptions_controller.queryNameSubscriptionsWithIDGet);

router.delete("/queries/:queryName/subscriptions/:subscriptionID", subscriptions_controller.queryNameSubscriptionsWithIdDelete);
 
module.exports = router;


// eventPost   eventGet eventsGetEvId