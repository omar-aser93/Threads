/********* Note: Thread model in this app used for both posting posts or comments */

import mongoose from "mongoose";

//create the schema : the structure of our database
const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   //1->1 models relation (1 thread can have 1 author)
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },           //1->1 models relation (1 thread can have 1 Community)
  createdAt: { type: Date, default: Date.now },
  parentId: { type: String },
  children: [ { type: mongoose.Schema.Types.ObjectId, ref: "Thread" } ],   //1->n [] models relation (1 thread can have multi children threads[] (comments))
});

//use the already exsit model || create new model by passing the schema 
const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;