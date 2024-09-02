"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { deleteThread } from "@/lib/server_actions/thread.actions";

//Typescript interface for received props types
interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

function DeleteThread({threadId, currentUserId, authorId, parentId, isComment }: Props) {
  
  const pathname = usePathname();                  //get pathname function , to get current URL 
  const router = useRouter();                      //get router function to push for another route auto

  //if current User is not the thread creator , don't show delete button .. else render delete button (image)
  if (currentUserId !== authorId || pathname === "/") return null;  

  return (
    <Image src='/assets/delete.svg' alt='delte' width={18} height={18} className='cursor-pointer object-contain'
      onClick={async () => {
        await deleteThread(JSON.parse(threadId), pathname);    //deleteThread server_action
        if (!parentId || !isComment) { router.push("/") }      //if thread is original thread (not a comment), redirect to home
      }}
    />
  );
}

export default DeleteThread;