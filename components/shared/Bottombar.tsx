"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


function Bottombar() {

  const pathname = usePathname();               //get pathname function , to get current URL
  //Array of objects stores the menu items data , we will map through it instead of writing one by one
  const sidebarLinks = [
    { imgURL: "/assets/home.svg",  route: "/", label: "Home" },{ imgURL: "/assets/search.svg", route: "/search", label: "Search" },
    { imgURL: "/assets/heart.svg", route: "/activity", label: "Activity" }, { imgURL: "/assets/create.svg", route: "/create-thread", label: "Create Thread" },
    { imgURL: "/assets/community.svg", route: "/communities", label: "Communities" }, { imgURL: "/assets/user.svg", route: "/profile", label: "Profile" }
  ];

  //This Bottombar component will only appear on sm display (mobile), it's the same as the sidebar & it replace it on sm 
  return (    
    <section className='bottombar'>
      <div className='bottombar_container'>
        {sidebarLinks.map((link) => {
          //get if the active menue link is equel to or part of the current URL , so we can change the style     
          const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

          return (
            <Link href={link.route} key={link.label} className={`bottombar_link ${isActive && "bg-primary-500"}`} >
              <Image src={link.imgURL} alt={link.label} title={link.label} width={16} height={16} className='object-contain'  />
              <p className='text-subtle-medium text-light-1 max-sm:hidden'>
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;