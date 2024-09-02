"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";


//Typescript interface for received props types
interface Props {
  routeType: string;
}


//Note : { routeType } received prop , to give us (user or community) because this component is used for both
function Searchbar({ routeType }: Props) {
 
  const router = useRouter();                    //get router function, to push for another route auto
  const [search, setSearch] = useState("");      //state to store search input value

  //if there's search value, push to route /query , query trigged after 0.3s of no input, like use-debounce lib but manually .. 
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        router.push(`/${routeType}?q=` + search);
      } else {
        router.push(`/${routeType}`);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, routeType]);

  return (
    <div className='searchbar'>
      <Image src='/assets/search-gray.svg' alt='search' width={24} height={24} className='object-contain' />
      <Input id='text' value={search} onChange={(e) => setSearch(e.target.value)} className='no-focus searchbar_input'
             placeholder={`${ routeType !== "/search" ? "Search communities" : "Search creators" }`}        
      />
    </div>
  );
}

export default Searchbar;