import mongoose from "mongoose";

//create the schema : the structure of our database
const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  threads: [ { type: mongoose.Schema.Types.ObjectId, ref: "Thread" } ],     //1->n [] models relation (1 user can have multi threads[])
  onboarded: { type: Boolean, default: false },
  communities: [ { type: mongoose.Schema.Types.ObjectId, ref: "Community" } ],   //1->n [] models relation (1 user can belong to multi communities[])
});

    //already exsit model then use it|| at 1st time create new model by passing the schema 
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;