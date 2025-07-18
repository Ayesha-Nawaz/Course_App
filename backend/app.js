const express = require("express");
const dotenv = require("dotenv");
const course = require("./Routes/courseRoute");
const users = require("./Routes/userRoutes");
const other = require("./Routes/otherRoutes");
const errorMiddleware = require("./MiddleWare/Error");
const cookieParser = require("cookie-parser");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());
//Importing and Using routes

app.use("/api/v1", course);
app.use("/api/v1", users);
 app.use("/api/v1", other);

app.use(errorMiddleware);

module.exports = app;
