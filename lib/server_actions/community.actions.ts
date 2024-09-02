"use server";

//Note: we're not using {revalidatePath} , because we will import Community actions & use them with clerk webhooks events instead

import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";               //manually created function to connect to mongoDB



/**************** createCommunity Controller/Server_Action  ****************/
export async function createCommunity(id: string, name: string, username: string, image: string, bio: string, createdById: string ) {
  try {    
    connectToDB();              //using this function with every server action to connect manually because we're not using express.js to connect 1 time
    
    const user = await User.findOne({ id: createdById });   //Find the user with the provided unique id
    if (!user) {  throw new Error("User not found")}        //if no user => "not found"

    //Create the new Community object using received data
    const newCommunity = new Community({id, name, username, image, bio, createdBy: user._id });
    const createdCommunity = await newCommunity.save();   //Save the new Community to the DB using : save()

    //Update User model by pushing the new Community to the creator user communities array
    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity;              //res with the created Community
  } catch (error: any) {
    throw new Error(`Error creating community: ${error.message}`);               //catch errors
  }
}



/**************** fetchCommunityDetails Controller/Server_Action  ****************/
export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB();                   //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //get a single Community using findOne(id) , populate() : return the actual creator user model
    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;                 //res with community data
  } catch (error: any) {
    throw new Error(`Error getting community details: ${error.message}`);               //catch errors
  }
}



/**************** fetchCommunityPosts Controller/Server_Action  ****************/
export async function fetchCommunityPosts(id: string) {
  try {
    connectToDB();                    //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //get a single Community using findById(id) , populate() : return the actual (threads & comments) models
    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" , "_id" and image fields from the "User" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "image" and "_id" fields from the "User" model for comments
          },
        },
      ],
    });

    return communityPosts;            //res with community posts
  } catch (error: any) {
    throw new Error(`Error fetching community posts: ${error.message}`);               //catch errors     
  }
}



/**************** fetchCommunities Controller/Server_Action  ****************/
export async function fetchCommunities({searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc"}: {
                      searchString?: string; pageNumber?: number; pageSize?: number; sortBy?: SortOrder;}) {
  try {
    connectToDB();          //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    //Calculate the amount of communities to skip based on page number and page size. (for each page in pagination) 
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};
    // If the received search string is not empty, add to the query we initiated (the $or operator) to match either username or name fields. 
    if (searchString.trim() !== "") {               //trim() removes extra white spaces before & after the string
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    //Find() the filtered communities by the query, then sort & skip amount of communities in pagination page, populate the actual members
    const communities = await Community.find(query).sort({createdAt: sortBy}).skip(skipAmount).limit(pageSize).populate("members");

    //Count the total number of communities that match the search criteria (without pagination), check if there's next page for pagination
    const totalCommunitiesCount = await Community.countDocuments(query);
    const isNext = totalCommunitiesCount > skipAmount + communities.length;        

    return { communities, isNext };               //res with filtered communities & isNext check
  } catch (error: any) {
    throw new Error(`Error fetching communities: ${error.message}`);               //catch errors   
  }
}



/**************** addMemberToCommunity Controller/Server_Action  ****************/
export async function addMemberToCommunity( communityId: string, memberId: string) {
  try {
    connectToDB();                 //using this function with every server action to connect manually because we're not using express.js to connect 1 time
    
    const community = await Community.findOne({ id: communityId });    //get a single Community using findOne(id) 
    if (!community) { throw new Error("Community not found") }         //if no Community => "not found"
    
    const user = await User.findOne({ id: memberId });                 //get a single User using findOne(id)
    if (!user) { throw new Error("User not found") }                   //if no user => "not found"

    //Check if the user is already a member of the community
    if (community.members.includes(user._id)) { throw new Error("User is already a member of the community") }

    //push the user's _id to the members array in the community & save the updated community to the DB
    community.members.push(user._id);
    await community.save();

    //push the community's _id to the communities array in the user & save the updated user to the DB
    user.communities.push(community._id);
    await user.save();

    return community;                     //res with the community
  } catch (error: any) {
      throw new Error(`Error adding member to community: ${error.message}`);               //catch errors     
  }  
}



/**************** removeUserFromCommunity Controller/Server_Action  ****************/
export async function removeUserFromCommunity( userId: string, communityId: string) {
  try {
    connectToDB();                   //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });       //get a single User using findOne(id)
    if (!userIdObject) { throw new Error("User not found")}                    //if no user => "not found"
    
    const communityIdObject = await Community.findOne({ id: communityId }, { _id: 1 });   //get a single Community using findOne(id) 
    if (!communityIdObject) { throw new Error("Community not found")}                     //if no Community => "not found"

    //Remove the user's _id from the members array in the community using: updateOne(id,$pull:{user_id})
    await Community.updateOne({ _id: communityIdObject._id }, { $pull: { members: userIdObject._id } });

    // Remove the community's _id from the communities array in the user using: updateOne(id,$pull:{community_id})
    await User.updateOne({ _id: userIdObject._id }, { $pull: { communities: communityIdObject._id } });

    return { success: true };              //res with success
  } catch (error: any) {
    throw new Error(`Error removing user from community: ${error.message}`);               //catch errors     
  }    
}



/**************** updateCommunityInfo Controller/Server_Action  ****************/
export async function updateCommunityInfo(communityId: string, name: string, username: string, image: string) {
  try {
    connectToDB();                   //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    // Find the community by its _id and update the information using: findOneAndUpdate(id,{received updating data})
    const updatedCommunity = await Community.findOneAndUpdate({ id: communityId }, { name, username, image });
    if (!updatedCommunity) { throw new Error("Community not found")}     //if no Community => "not found"

    return updatedCommunity;                      //res with updated community
  } catch (error: any) {
    throw new Error(`Error updating community information: ${error.message}`);               //catch errors     
  }    
}



/**************** deleteCommunity Controller/Server_Action  ****************/
export async function deleteCommunity(communityId: string) {
  try {
    connectToDB();                //using this function with every server action to connect manually because we're not using express.js to connect 1 time

    // Find the community by its ID and delete it using: findOneAndDelete(id)
    const deletedCommunity = await Community.findOneAndDelete({ id: communityId});
    if (!deletedCommunity) { throw new Error("Community not found") }        //if no Community => "not found"

    //Delete all threads associated with the community using: Thread.deleteMany(community_id)
    await Thread.deleteMany({ community: communityId });

    //Find() all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });

    //Map through communityUsers & Remove the community from the 'communities' array for each user
    await Promise.all(communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();        //Save the updated user to the DB
    }) );

    return deletedCommunity;               //res with deleted Community
  } catch (error: any) {
    throw new Error(`Error deleting community: ${error.message}`);               //catch errors     
  } 
}