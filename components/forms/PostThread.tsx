"use client";

//Shadcn form downloads & use (zod,react-hook-form) by default , follow docs : https://ui.shadcn.com/docs/components/form
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThreadValidation } from "@/lib/validations";       //get (Thread form validation) from Zod file we created 
import { createThread } from "@/lib/server_actions/thread.actions";
import { useOrganization } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";


//Typescript interface for received props types
interface Props {
  userId: string;
}

function PostThread({ userId }: Props) {
  
  const router = useRouter();                    //get router function to push for another route auto
  const pathname = usePathname();                //get pathname function , to get current URL

  const { organization } = useOrganization();    //get data of current organization from clerk, Organization group users together and manage their permissions.

  //shadcn form docs, useForm from react-hook-form to apply the zod validation we imported , also giving default values to the inputs
  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  //handle submit function to create thread in the DB , Note: (values) is the inputs values by "react-hook-form"
  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    //createThread server action & passing the input value
    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push("/");       //after thread created, redirect to home
  };

  {/*we copied the Form from shadcn docs then added & edited the FormFields we want */}
  return (
    <Form {...form}>
      <form className='mt-10 flex flex-col justify-start gap-10' onSubmit={form.handleSubmit(onSubmit)} >
        <FormField control={form.control} name='thread' render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'> Content </FormLabel>
              <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-primary-500'> Post Thread </Button>
      </form>
    </Form>
  );
}

export default PostThread;