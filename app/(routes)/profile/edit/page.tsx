import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/server_actions/user.actions";
import AccountProfile from "@/components/forms/AccountProfile";


//Copy paste most of the code as it is from the /onboarding , Both are for editing user data, but onboarding only used once for register first time
async function Page() {

  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings
    
  //fetch current user data from the DB, using the id from clerk, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //user data object, we get the data from either Clerk or our DB, then we pass them as props for AccountProfile component
  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <>
      <h1 className='head-text'>Edit Profile</h1>
      <p className='mt-3 text-base-regular text-light-2'>Make any changes</p>

      <section className='mt-12'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </>
  );
}

export default Page;