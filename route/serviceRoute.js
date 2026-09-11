const express = require("express");
const router = express.Router();
const { createService, getServices } = require("../controllers/serviceController");
const authenticateToken = require("../middleware/auth");

router.use(authenticateToken);

router.post("/", createService);
router.get("/", getServices);

module.exports = router;
