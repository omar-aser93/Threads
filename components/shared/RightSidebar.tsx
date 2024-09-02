import { currentUser } from "@clerk/nextjs/server";
import UserCard from "../cards/UserCard";
import { fetchCommunities } from "@/lib/server_actions/community.actions";
import { fetchUsers } from "@/lib/server_actions/user.actions";

async function RightSidebar() {

  const user = await currentUser();              //get user data from clerk currentUser()
  if (!user) return null;                        //no user => null , to avoid typescript warnings

  const similarMinds = await fetchUsers({ userId: user.id, pageSize: 4 });     //fetchUsers Server Action
  const suggestedCOmmunities = await fetchCommunities({ pageSize: 4 });        //fetchCommunities Server Action 

  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'> Suggested Communities </h3>

        {/*map through fetched Communities & show each one in a card component*/}
        <div className='mt-7 flex w-[350px] flex-col gap-9'>
          {suggestedCOmmunities.communities.length > 0 ? (
            <>
              {suggestedCOmmunities.communities.map((community) => (
                <UserCard key={community.id} id={community.id} name={community.name} username={community.username} imgUrl={community.image} personType='Community' />
              ))}
            </>
          ) : (
            <p className='!text-base-regular text-light-3'> No communities yet </p>
          )}
        </div>
      </div>

      {/*map through fetched users & show each one in a card component*/}    
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>Similar Minds</h3>
        <div className='mt-7 flex w-[350px] flex-col gap-10'>
          {similarMinds.users.length > 0 ? (
            <>
              {similarMinds.users.map((person) => (
                <UserCard key={person.id} id={person.id} name={person.name} username={person.username} imgUrl={person.image} personType='User'/>
              ))}
            </>
          ) : (
            <p className='!text-base-regular text-light-3'>No users yet</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default RightSidebar;