"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";          //used with (post,delete,update) actions to refresh data directly after change, but not with (fetch) we use return directly
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";            //manually created function to connect to mongoDB



/**************** fetchUser Controller/Server_Action  ****************/
export async function fetchUser(userId: string) {
  try {
    connectToDB();         //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //get a single user using: findOne(id).populate() : return the actual communities models in relation with the current user, like [include()] in prisma)
    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);           //catch errors
  }
}



/**************** updateUser Controller/Server_Action  ****************/
//Typescript interface for received parames types
interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({ userId, bio, name, path, username, image }: Params): Promise<void> {
  try {
    connectToDB();         //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //update a user using: findOneAndUpdate(id, {new data we received}, upsert : update if exsits & insert if it doesn't ) 
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );

    //revalidate & update data , remove cached data for this path & return freshly fetched data on your next visit  
    if (path === "/profile/edit") { revalidatePath(path); }       //this action used in both (/onBoaring) , (/profile/edit) .. only need revalidate on (/profile/edit)
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);            //catch errors
  }
}



/**************** fetchUserPosts Controller/Server_Action  ****************/
export async function fetchUserPosts(userId: string) {
  try {    
    connectToDB();           //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //Find all threads authored by a user using: findOne(id).populate() : return the actual (threads models & childeren comments) in relation with the current user, like [include()] in prisma)
    return await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id",   // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",    // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });    
  } catch (error: any) {
    throw new Error(`Failed to fetch this User Posts: ${error.message}`);               //catch errors
  }
}



/**************** fetchUsers Controller/Server_Action  ****************/
// Almost similar to Thread (search + pagination) and Community (search + pagination)
export async function fetchUsers({ userId, searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc"}: {
                      userId: string; searchString?: string; pageNumber?: number; pageSize?: number; sortBy?: SortOrder;}) {
  try {
    connectToDB();            //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //Calculate the amount of users to skip based on page number and page size. (for each page in pagination)
    const skipAmount = (pageNumber - 1) * pageSize;

    //Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");
    
    //Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },      // Exclude the current user from the results.
    };
    //If the received search string is not empty, add to the query we initiated (the $or operator) to match either username or name fields. 
    if (searchString.trim() !== "") {                //trim() removes extra white spaces before & after the string
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    //Find() the filtered users by the query, then sort & skip amount of users in pagination page
    const users = await User.find(query).sort({ createdAt: sortBy }).skip(skipAmount).limit(pageSize);

    //Count the total number of users that match the search criteria (without pagination), check if there's next page for pagination
    const totalUsersCount = await User.countDocuments(query);
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };             //res with filtered users & isNext check
  } catch (error: any) {
    throw new Error(`Failed to fetch Users: ${error.message}`);               //catch errors
  }
}



/**************** getActivity Controller/Server_Action  ****************/
export async function getActivity(userId: string) {
  try {
    connectToDB();              //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //Find all threads created by a user using : find(id)
    const userThreads = await Thread.find({ author: userId });

    /* Collect all (comments) ids from the 'children' field of each thread created by the user :
    - items.reduce(accumulator,item) .. the accumulator (acc) starts as empty array [], then it gets updated on each loop based on the logic provided in the callback function .
    - For each userThread, the callback function is .concat() of 'children/comments IDs' of the current 'userThread' , push it to the accumulator untill it returns a single value result [comments ids] */
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    //Find() and return the child threads (comments) excluding the ones created by the same user
    return await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },    // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
  } catch (error: any) {
    throw new Error(`Failed to get Activity : ${error.message}`);               //catch errors
  }
}