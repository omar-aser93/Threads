import { ClerkProvider } from "@clerk/nextjs";        //ClerkProvider we wrap it around the layout
import { dark } from "@clerk/themes";                 //Dark theme for clerk forms, we pass it to ClerkProvider
import type { Metadata } from "next";
import { Inter } from "next/font/google";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth",
  description: "Generated by create next app",
};

                                                         //children Typescript type
export default function RootLayout({ children}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }} >
      <html lang='en'>
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen"> {children} </div> 
        </body>
      </html>
    </ClerkProvider>
  );
}
