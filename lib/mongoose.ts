import mongoose from "mongoose";

let isConnected = false;            // Variable to track the connection status

export const connectToDB = async () => {
  
  mongoose.set("strictQuery", true);    // Set strict query mode for Mongoose to prevent unknown field queries.
  if (!process.env.MONGODB_URL) return console.log("Missing MongoDB URL");   //no mongodb url => "missing"
  
  // If the connection is already established, return without creating a new connection.
  if (isConnected) { console.log("MongoDB connection already established");   return;  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URL);     //create new DB Connection & pass mongoDB Key
    isConnected = true;           // Set the connection status to true
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};