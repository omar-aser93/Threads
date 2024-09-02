// Resource: https://docs.uploadthing.com/getting-started/appdir#create-a-nextjs-api-route-using-the-filerouter
// Copy paste (be careful with imports)

import { createRouteHandler } from "uploadthing/next";
 
import { ourFileRouter } from "./core";
 
// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
 
  // Apply an (optional) custom config:
  // config: { ... },
});