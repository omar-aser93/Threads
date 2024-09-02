import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";                
import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import { fetchPosts } from "@/lib/server_actions/thread.actions";
import { fetchUser } from "@/lib/server_actions/user.actions";

async function Home({ searchParams}: { searchParams: { [key: string]: string | undefined }}) {
  
  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings

  //fetch current user data from the DB, using the id from clerk, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //fetchPosts server_action .. to fetch all posts after we pass searchParams to the action for pagination 
  const result = await fetchPosts( searchParams.page ? +searchParams.page : 1, 30 );

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>
      <section className='mt-9 flex flex-col gap-10'>
        {/*if no posts => "No threads" .. if found, map through them and pass props to ThreadCard component*/}
        {result.posts.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard key={post._id} id={post._id} currentUserId={user.id} parentId={post.parentId} content={post.text} author={post.author} community={post.community} createdAt={post.createdAt} comments={post.children} />
            ))}
          </>
        )}
      </section>

      {/*Show Pagination component & pass (pageNumber, isNext) props */}
      <Pagination path='/' pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.isNext} />
    </>
  );
}

export default Home;