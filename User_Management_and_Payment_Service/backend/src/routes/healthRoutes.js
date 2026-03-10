const express = require("express");
const healthRouter = express.Router();
const healthController = require('../controllers/healthCheckController');

healthRouter.get("/", healthController.getHealth);

module.exports = healthRouter;