import mongoose from "mongoose";                   

//create the schema : the structure of our database
const communitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },       //1->1 models relation (1 community can have 1 creator)
  threads: [ { type: mongoose.Schema.Types.ObjectId, ref: "Thread" } ],   //1->n [] models relation (1 community can belong to multi Threads[])
  members: [ { type: mongoose.Schema.Types.ObjectId, ref: "User" } ],     //1->n [] models relation (1 community can belong to multi members[])
});

//use the already exsit model || create new model by passing the schema 
const Community = mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;