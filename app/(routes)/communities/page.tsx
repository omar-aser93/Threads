import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";
import CommunityCard from "@/components/cards/CommunityCard";
import { fetchUser } from "@/lib/server_actions/user.actions";
import { fetchCommunities } from "@/lib/server_actions/community.actions";

async function Page({searchParams}: {searchParams: { [key: string]: string | undefined }}) {
  
  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings

  //fetch current user data from the DB, using the id from clerk, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //fetchCommunities server_actions , we pass search & paginations params
  const result = await fetchCommunities({
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <>
      <h1 className='head-text'>Communities</h1>

      {/* Searchbar Component */}
      <div className='mt-5'> <Searchbar routeType='communities' />  </div>

      {/*If there's no Communities => "No Result" .. else, map through the communities & pass props to the CommunityCard component */}
      <section className='mt-9 flex flex-wrap gap-4'>
        {result.communities.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard key={community.id} id={community.id} name={community.name} username={community.username} imgUrl={community.image} bio={community.bio} members={community.members} />
            ))}
          </>
        )}
      </section>

      {/* Pagination component */}
      <Pagination path='communities' pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.isNext} />
    </>
  );
}

export default Page;