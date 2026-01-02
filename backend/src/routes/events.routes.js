const express = require("express");
const router = express.Router();
const controller = require("../controllers/events.controller");

router.post("/", controller.createEvent);
router.get("/", controller.getEvents);
router.patch("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);

router.get("/categories", async (req, res) => {
  try {
    const result = await controller.getCategories();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

module.exports = router;
