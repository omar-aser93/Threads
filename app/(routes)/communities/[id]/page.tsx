import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCommunityDetails } from "@/lib/server_actions/community.actions";


async function Page({ params }: { params: { id: string } }) {

  //Array of objects stores the tabs items data , we will map through it instead of writing one by one
  const communityTabs = [
      { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
      { value: "members", label: "Members", icon: "/assets/members.svg" },
      { value: "requests", label: "Requests", icon: "/assets/request.svg" },
  ];

  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings

  //fetch community data from the DB, using the [id] from URL
  const communityDetails = await fetchCommunityDetails(params.id);

  return (
    <section>
      <ProfileHeader accountId={communityDetails.createdBy.id} authUserId={user.id} name={communityDetails.name} 
                     username={communityDetails.username} imgUrl={communityDetails.image} bio={communityDetails.bio} type='Community' />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>

            {/*map through communityTabs array to show the tabs (shadcn tabs) */}
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image src={tab.icon} alt={tab.label} width={24} height={24} className='object-contain' />
                <p className='max-sm:hidden'>{tab.label}</p>
                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {communityDetails.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Community Threads */}  
          <TabsContent value='threads' className='w-full text-light-1'>           
            <ThreadsTab currentUserId={user.id} accountId={communityDetails._id} accountType='Community' />
          </TabsContent>

          {/* Community members */}
          <TabsContent value='members' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
              {communityDetails.members.map((member: any) => (
                <UserCard key={member.id} id={member.id} name={member.name} username={member.username} imgUrl={member.image} personType='User' />
              ))}
            </section>
          </TabsContent>

          <TabsContent value='requests' className='w-full text-light-1'>            
            <ThreadsTab currentUserId={user.id} accountId={communityDetails._id} accountType='Community'  />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;