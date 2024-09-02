"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

//Typescript interface for received props types
interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
}

function UserCard({ id, name, username, imgUrl, personType }: Props) {
  
  const router = useRouter();                          //get router function, to push for another route auto
  //isCommunity return true, if personType === "Community" .. As this card component is used for both user & Community
  const isCommunity = personType === "Community";     

  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image src={imgUrl} alt='user_logo' fill className='rounded-full object-cover' />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{name}</h4>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      <Button onClick={() => {(isCommunity) ? router.push(`/communities/${id}`) :  router.push(`/profile/${id}`) }} className='user-card_btn' >
        View
      </Button>
    </article>
  );
}

export default UserCard;