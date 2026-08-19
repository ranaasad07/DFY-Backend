// config/db.js
// ------------------------------------------------------------------
// This file is responsible for ONE thing: connecting to MongoDB.
//
// Teaching note for new devs:
// - We use Mongoose (an ODM = Object Data Modeling library) instead of
//   the raw MongoDB driver because it gives us schemas, validation,
//   and easier querying.
// - Whether MongoDB is running locally or in the cloud (MongoDB Atlas),
//   MongoDB Compass (the GUI app) can connect to the SAME connection
//   string defined in .env (MONGO_URI) so you can visually inspect
//   the "users" collection while testing signup/login.
// ------------------------------------------------------------------

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is missing. Please ensure your backend/.env file exists and includes MONGO_URI.",
      );
    }
    // mongoose.connect() returns a promise, so we await it.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // If the DB fails to connect, there's no point running the server.
    process.exit(1);
  }
};

module.exports = connectDB;
