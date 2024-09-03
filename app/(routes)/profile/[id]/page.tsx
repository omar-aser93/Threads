import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUser } from "@/lib/server_actions/user.actions";


async function Page({ params }: { params: { id: string } }) {

  //Array of objects stores the tabs items data , we will map through it instead of writing one by one
  const profileTabs = [
     { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
     { value: "replies", label: "Replies", icon: "/assets/members.svg" },
     { value: "tagged", label: "Tagged", icon: "/assets/tag.svg" },
  ];  

  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings

  //fetch current user data from the DB, using the [id] from URL, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(params.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <section>
      <ProfileHeader accountId={userInfo.id} authUserId={user.id} name={userInfo.name} username={userInfo.username} imgUrl={userInfo.image} bio={userInfo.bio} />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            
            {/*map through profileTabs array to show the tabs (shadcn tabs) */}
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image src={tab.icon} alt={tab.label} width={24} height={24} className='object-contain' />
                <p className='max-sm:hidden'>{tab.label}</p>
                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'> {userInfo.threads.length} </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {profileTabs.map((tab) => (
            <TabsContent  key={`content-${tab.label}`} value={tab.value} className='w-full text-light-1' >             
              <ThreadsTab currentUserId={user.id} accountId={userInfo.id} accountType='User' />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;