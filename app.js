const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const bodyParser = require("body-parser");
const routeManager = require("./routes/index");
const cors = require("cors");

require("dotenv").config({ path: "variables.env" });

mongoose.connect(process.env.DATABASE);
mongoose.connection.on("open", () => {
  console.log("Successfully connected to DB");
});
mongoose.connection.on("error", (err) => {
  console.log("ERROR:", err.message);
});

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,authorization"
  );
  next();
});

app.use("/", routeManager);

app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    success: false,
    data: err.data,
    error: {},
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server is running at port: ${process.env.PORT}`);
});
