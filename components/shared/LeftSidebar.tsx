"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";


const LeftSidebar = () => {
  
  const { userId } = useAuth();               //get user ID from clerk useAuth() function, will use it for profile link, we can also instead use currentUser()
  
  const pathname = usePathname();             //get pathname function , to get current URL
  //Array of objects stores the menu items data , we will map through it instead of writing one by one
  const sidebarLinks = [
    { imgURL: "/assets/home.svg",  route: "/", label: "Home" },{ imgURL: "/assets/search.svg", route: "/search", label: "Search" },
    { imgURL: "/assets/heart.svg", route: "/activity", label: "Activity" }, { imgURL: "/assets/create.svg", route: "/create-thread", label: "Create Thread" },
    { imgURL: "/assets/community.svg", route: "/communities", label: "Communities" }, { imgURL: "/assets/user.svg", route: "/profile", label: "Profile" }
  ];

  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        {sidebarLinks.map((link) => {
          //get if the active menue link is equel to or part of the current URL , so we can change the style  
          const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;
          if (link.route === "/profile") link.route = `${link.route}/${userId}`;   //for profile link add /{userId}, so link will go to the current user profile

          return (
            <Link href={link.route} key={link.label} className={`leftsidebar_link ${isActive && "bg-primary-500 "}`}  >
              <Image  src={link.imgURL} alt={link.label} title={link.label} width={24} height={24} />
              <p className='text-light-1 max-lg:hidden'>{link.label}</p>
            </Link>
          );
        })}
      </div>

       {/*Clerk SignOut Button, If user is <SignedIn> */}
      <div className='mt-10 px-6'>
        <SignedIn>
          <SignOutButton redirectUrl= "/sign-in" >
            <div className='flex cursor-pointer gap-4 p-4'>
              <Image src='/assets/logout.svg' alt='logout' width={24} height={24} />
              <p className='text-light-2 max-lg:hidden'>Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
};

export default LeftSidebar;