import { currentUser } from "@clerk/nextjs/server";
//similar to routter.push(), but doesn't push a new entry into browser history stack, also it works in both client & server unlike useRouter()
import { redirect } from "next/navigation";
import UserCard from "@/components/cards/UserCard";
import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";
import { fetchUser, fetchUsers } from "@/lib/server_actions/user.actions";


async function Page({ searchParams}: { searchParams: { [key: string]: string | undefined }}) {
 
  const user = await currentUser();                   //get user data from clerk currentUser()
  if (!user) return null;                             //no user => null , to avoid typescript warnings
  
  //fetch current user data from the DB, using the id from clerk, if user data is not in the DB redirect to /onboarding to fill the data
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //fetchUsers server_action, and pass search params & pagination parameters
  const result = await fetchUsers({
    userId: user.id,
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <section>
      <h1 className='head-text mb-10'>Search</h1>
      {/*SeaarchBar component */}
      <Searchbar routeType='search' />

      {/*if there's users, map through them and pass them to userCard component */}
      <div className='mt-14 flex flex-col gap-9'>
        {result.users.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard key={person.id} id={person.id} name={person.name} username={person.username} imgUrl={person.image} personType='User' />
            ))}
          </>
        )}
      </div>

      {/* Pagination component */}
      <Pagination path='search' pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.isNext} />
    </section>
  );
}

export default Page;