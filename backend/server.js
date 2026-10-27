"use strict";
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`
});

const express = require("express");

const app = express();

app.listen(process.env.PORT || 8000, async () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
  await require("./common/connect").connect();

})
