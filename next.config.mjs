/** @type {import('next').NextConfig} */

//Allowing external sources to work with next
const nextConfig = {
    experimental: {        
        serverComponentsExternalPackages: ["mongoose"],
      },
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "img.clerk.com",
          },
          {
            protocol: "https",
            hostname: "images.clerk.dev",
          },
          {
            protocol: "https",
            hostname: "uploadthing.com",
          },
          {
            protocol: "https",
            hostname: "placehold.co",
          },
          {
            protocol: "https",
            hostname: "utfs.io",
          },
        ],
      },
};

export default nextConfig;
