const app = require("./app");
const connectDatabase = require("./Config/database");
const dotenv = require("dotenv");
const nodeCron = require("node-cron");

const cloudinary = require("cloudinary");
const Stats = require("./Models/Stats");

connectDatabase();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server is working at port:${process.env.PORT}`);
});
