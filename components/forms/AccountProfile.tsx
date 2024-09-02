"use client";

//Shadcn form downloads & use (zod,react-hook-form) by default , follow docs : https://ui.shadcn.com/docs/components/form
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { UserValidation } from "@/lib/validations";            //get (user form validation) from Zod file we created 
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";           //import the file we created for UploadThing lib
import { isBase64Image } from "@/lib/utils";
import { updateUser } from "@/lib/server_actions/user.actions";


//Typescript interface for received props types
interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {

  const router = useRouter();                           //get router function to push for another route auto
  const pathname = usePathname();                       //get pathname function , to get current URL  
  const { startUpload } = useUploadThing("media");      //get UploadThing lib hook 
  const [files, setFiles] = useState<File[]>([]);       //state to store uploaded image file

  //shadcn form docs, useForm from react-hook-form to apply the zod validation we imported , also giving default values to the inputs
  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image ? user.image : "",
      name: user?.name ? user.name : "",
      username: user?.username ? user.username : "",
      bio: user?.bio ? user.bio : "",
    },
  });


//handle submit function to update user's data in the DB , Note: (values) is the inputs values by "react-hook-form"
  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const hasImageChanged = isBase64Image(values.profile_photo);    //check img change using isBase64Image() from utils.ts file
    //if img changed , get img response using startUpload() hook from UploadThing lib
    if (hasImageChanged) {
      const imgRes = await startUpload(files);      
      if (imgRes && imgRes[0].url) { values.profile_photo = imgRes[0].url }
    }
    //Server action to update user's data
    await updateUser({
      name: values.name,
      path: pathname,
      username: values.username,
      userId: user.id,
      bio: values.bio,
      image: values.profile_photo,
    });

    //if we are on edit route => go prev page , if onboarding route or others go to "/"
    (pathname === "/profile/edit") ? router.back() : router.push("/");    
  };


//function to handle image upload input
  const handleImage = ( e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void ) => {
    e.preventDefault();
    const fileReader = new FileReader();    //instance from FileReader webAPI class, used to async read a file
    
    if (e.target.files && e.target.files.length > 0) {    //check if the upload file input is not 0       
      setFiles(Array.from(e.target.files));         //set the state with the input file
      if (!e.target.files[0].type.includes("image")) return;    //if type is not "image" return out of the function

      //function to change the upload input text to the new image url when the new image uploaded  [react-hook-form fieldChange() method]
      fileReader.onload = async (event) => {        
        fieldChange(event.target?.result?.toString() || "");
      };
      fileReader.readAsDataURL(e.target.files[0]);      //read the file using fileReader
    }
  };


  {/*we copied the Form from shadcn docs then added & edited the FormFields we want */}
  return (    
    <Form {...form}>
      <form className='flex flex-col justify-start gap-10' onSubmit={form.handleSubmit(onSubmit)}  >
        <FormField control={form.control} name='profile_photo' render={({ field }) => (
            <FormItem className='flex items-center gap-4'>
              <FormLabel className='account-form_image-label'>
                {field.value ? (
                  <Image src={field.value} alt='profile_icon' width={96} height={96} priority className='rounded-full object-contain' />
                ) : (
                  <Image src='/assets/profile.svg' alt='profile_icon' width={24} height={24} className='object-contain' />
                )}
              </FormLabel>
              <FormControl className='flex-1 text-base-semibold text-gray-200'>
                <Input onChange={(e) => handleImage(e, field.onChange)} type='file' accept='image/*' placeholder='Add profile photo' className='account-form_image-input' />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField control={form.control} name='name' render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'> Name </FormLabel>
              <FormControl>
                <Input type='text' className='account-form_input no-focus' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name='username' render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'> Username </FormLabel>
              <FormControl>
                <Input type='text' className='account-form_input no-focus' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name='bio' render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'> Bio </FormLabel>
              <FormControl>
                <Textarea rows={10} className='account-form_input no-focus' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-primary-500'> {btnTitle} </Button>
      </form>
    </Form>
  );
};

export default AccountProfile;