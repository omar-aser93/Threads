"use server";

import { revalidatePath } from "next/cache";       //used with (post,delete,update) actions to refresh data directly after change, but not with (fetch) we use return directly
import { connectToDB } from "../mongoose";         //manually created function to connect to mongoDB
import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";             



/**************** fetchPosts Controller/Server_Action  ****************/
export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();             //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //Calculate the amount of posts to skip based on page number and page size. (for each page in pagination)
    const skipAmount = (pageNumber - 1) * pageSize;

    //Create a query to get the posts that have no parentId (top-level threads, posts not comments/replies), because thread model used for both posts & comments
    //sort & skip amount of posts in pagination page, then populate() : return the actual (models & childeren comments) in relation with each thread, like [include()] in prisma)
    const posts = await Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" }).skip(skipAmount).limit(pageSize)           
      .populate({ path: "author", model: User })
      .populate({ path: "community", model: Community })
      .populate({ path: "children", populate: {
          path: "author",    //Populate the author field within children comment
          model: User,
          select: "_id name parentId image",   //Select only _id , username and image fields of the author
        },
      });

    //Count the total number of top-level posts (threads not comments) , check if there's next page for pagination
    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });     
    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };          //res with filtered posts & isNext check
  } catch (error: any) {
    throw new Error(`Failed to get the Threads: ${error.message}`);               //catch errors
  }
}



/**************** createThread Controller/Server_Action  ****************/
//Typescript interface for received parames types
interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDB();                 //using this function with every server action  to connect manually because we're not using express.js to connect 1 time
    
    //get a single Community DB_id using: findeOne(community_clerk_id)
    const communityIdObject = await Community.findOne({ id: communityId }, { _id: 1 });
    //create a Thread using: create({received data})
    const createdThread = await Thread.create({ text, author, community: communityIdObject }); // Assign communityId if provided, or leave it null for personal account
    //add the new thread to user's threads array using: findByIdAndUpdate(id, {$push:{threads : id of new created thread }}) 
    await User.findByIdAndUpdate(author, { $push: { threads: createdThread._id } });

    //if thread havd communityId, add the new thread to community's threads array using: findByIdAndUpdate(id, {$push:{threads : id of new created thread }}) 
    if (communityIdObject) {      
      await Community.findByIdAndUpdate(communityIdObject, { $push: { threads: createdThread._id } });
    }

    revalidatePath(path);    //revalidate & update data, remove cached data for this path & return freshly fetched data on your next visit
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);               //catch errors
  }
}



/**************** deleteThread Controller/Server_Action  ****************/

//function used to get the comments & the comments of the comments
async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });
  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }
  return descendantThreads;
} 

export async function deleteThread(id: string, path: string): Promise<void> {
  try {    
    connectToDB();                //using this function with every server action  to connect manually because we're not using express.js to connect 1 time

    //get the main thread to be deleted using: findById(id).populate() : return the actual models in relation with the current Thread, like [include()] in prisma)
    const mainThread = await Thread.findById(id).populate("author community");
    if (!mainThread) { throw new Error("Thread not found"); }          //if no thread found => "not found"
    

    //Fetch all child threads (comments) and their descendants recursively, using fetchAllChildThreads() server_action
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including [the main thread ID , child thread IDs by mapping through them]
    const descendantThreadIds = [ id, ...descendantThreads.map((thread) => thread._id) ];

    //Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Update User model
    await User.updateMany({ _id: { $in: Array.from(uniqueAuthorIds) }}, { $pull: { threads: { $in: descendantThreadIds } }} );

    // Update Community model
    await Community.updateMany({ _id: { $in: Array.from(uniqueCommunityIds) }}, { $pull: { threads: { $in: descendantThreadIds } }} );

    revalidatePath(path);          //revalidate & update data, remove cached data for this path & return freshly fetched data on your next visit
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);            //catch errors
  }
}



/**************** fetchThreadById Controller/Server_Action  ****************/
export async function fetchThreadById(threadId: string) {  
  try {
    connectToDB();            //using this function with every server action  to connect manually because we're not using express.js to connect 1 time
    
    //get a single Thread using: findById(id) , populate() : return the actual (models & childeren comments) in relation with the thread, like [include()] in prisma)
    const thread = await Thread.findById(threadId)
      .populate({ path: "author", model: User, select: "_id id name image" }) // Populate the author field with _id, username, image
      .populate({ path: "community", model: Community, select: "_id id name image" }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id, image and username fields of the author
          },
          {
            path: "children", // Populate the children field within children (comment on a comment)
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id, image and username fields of the author
            },
          },
        ],
      }) ;

    return thread;           //res with the Thread data
  } catch (error: any) {
    throw new Error(`Failed to get the Thread: ${error.message}`);               //catch errors
  }
}



/**************** addCommentToThread Controller/Server_Action  ****************/
export async function addCommentToThread( threadId: string, commentText: string, userId: string, path: string) {
  try {
    connectToDB();            //using this function with every server action  to connect manually because we're not using express.js to connect 1 time

    //Find the original thread by ID , using findById(id)
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) { throw new Error("Thread not found") }     //if can't find the Thread => error

    //Create the new comment thread 
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });
    
    const savedCommentThread = await commentThread.save();   //Save the comment thread to the DB using : save()

    //Add the new comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);    
    await originalThread.save();     // Save the updated original thread to the DB using : save()

    revalidatePath(path);            //revalidate & update data, remove cached data for this path & return freshly fetched data on your next visit
  } catch (error: any) {
    throw new Error(`Failed to add Comment To the Thread: ${error.message}`);           //catch errors
  }
}