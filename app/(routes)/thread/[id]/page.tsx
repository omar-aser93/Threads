import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";   
import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchUser } from "@/lib/server_actions/user.actions";
import { fetchThreadById } from "@/lib/server_actions/thread.actions";


async function page({ params }: { params: { id: string } }) {

  if (!params.id) return null;                        //if no id , return null

  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings

  //fetch current user data from the DB, using the id from clerk, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //fetchThreadById server_action .. to fetch a single thread as we pass the [id] from page URL params
  const thread = await fetchThreadById(params.id);

  return (
    <section className='relative'>
      {/* The Main Thread component */}
      <div>
        <ThreadCard id={thread._id} currentUserId={user.id} parentId={thread.parentId} content={thread.text} author={thread.author} community={thread.community} createdAt={thread.createdAt} comments={thread.children} />
      </div>

      {/* Comment Form component */}  
      <div className='mt-7'>
        <Comment threadId={params.id} currentUserImg={user.imageUrl} currentUserId={JSON.stringify(userInfo._id)} />
      </div>

      {/* map through Thread comments, then pass the props to the comment threadCard compnent */}
      <div className='mt-10'>
        {thread.children.map((childItem: any) => (
          <ThreadCard key={childItem._id} id={childItem._id} currentUserId={user.id} parentId={childItem.parentId} content={childItem.text} author={childItem.author} community={childItem.community} createdAt={childItem.createdAt} comments={childItem.children} isComment />
        ))}
      </div>
    </section>
  );
}

export default page;