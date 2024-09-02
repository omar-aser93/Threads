import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/server_actions/user.actions";
import AccountProfile from "@/components/forms/AccountProfile";


async function Page() {

  const user = await currentUser();                //get user data from clerk currentUser()
  if (!user) return null;                          //no user => null , to avoid typescript warnings

  const userInfo = await fetchUser(user.id);       //fetchUser Server Action, pass (id) to get userInfo from the DB, not Clerk
  if (userInfo?.onboarded) redirect("/");          //if DB user have onboard data finished before, redirect("/")

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
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
      <h1 className='head-text'>Onboarding</h1>
      <p className='mt-3 text-base-regular text-light-2'> Complete your profile now, to use Threds. </p>

      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  );
}

export default Page;