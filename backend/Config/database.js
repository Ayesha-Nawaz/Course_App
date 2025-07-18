const mongoose = require("mongoose");
const connectDatabase = async() => {
 const connection = await mongoose.connect(process.env.DB_URI, {}).then((data) => {
    console.log(`Mongodb connected with server : ${data.connection.host}`);
  });
};

module.exports = connectDatabase;
