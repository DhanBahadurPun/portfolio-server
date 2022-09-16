const express = require("express");
const router = express.Router();

const apiRouter = require("../modules/stock/stock.routes");

router.use("/api/v1", apiRouter);

module.exports = router;
