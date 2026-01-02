const express = require("express");
const router = express.Router();
const controller = require("../controllers/events.controller");

router.post("/", controller.createEvent);
router.get("/", controller.getEvents);
router.patch("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);

module.exports = router;
