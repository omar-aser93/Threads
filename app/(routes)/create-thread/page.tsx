import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/server_actions/user.actions";


async function Page() {
  
  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings

  //fetch current user data from the DB, using the id from clerk, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className='head-text'>Create Thread</h1>
      <PostThread userId={userInfo._id} />
    </>
  );
}

export default Page;