//This file is for clerk auth , we created it following createing clerk projct steps & [Clerk docs]

import { clerkMiddleware , createRouteMatcher } from "@clerk/nextjs/server";

//manually make sure that (/sign-in , /sign-up) routes are public, also add any routes you don't want it protected(so they open for non-logged users) 
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)','/api/uploadthing(.*)'])
//non public routes are protected by auth()
export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};