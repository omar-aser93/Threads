import { fetchCommunityPosts } from "@/lib/server_actions/community.actions";
import { fetchUserPosts } from "@/lib/server_actions/user.actions";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";


//Typescript interface for received props types
interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}


//Typescript interface for fetched data types
interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}


async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  
  //Tabs component is used for both users & Communities, so we create result var to store the data after we check the type   
  let result: Result;
  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);           //server_action to fetch Community Posts
  } else {
    result = await fetchUserPosts(accountId);               //server_action to fetch User Posts
  }

  if (!result) { redirect("/") }     //if no fetched data => redirect to home

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.threads.map((thread) => (
        <ThreadCard key={thread._id} id={thread._id} currentUserId={currentUserId} parentId={thread.parentId} content={thread.text}
          author={
            accountType === "User" ? { name: result.name, image: result.image, id: result.id }
              : { name: thread.author.name, image: thread.author.image, id: thread.author.id }
          }
          community={ accountType === "Community" ? { name: result.name, id: result.id, image: result.image } : thread.community }
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
}

export default ThreadsTab;