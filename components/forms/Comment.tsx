"use client";

//Shadcn form downloads & use (zod,react-hook-form) by default , follow docs : https://ui.shadcn.com/docs/components/form
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { CommentValidation } from "@/lib/validations";     //get (Comment form validation) from Zod file we created 
import Image from "next/image";
import { usePathname } from "next/navigation";
import { addCommentToThread } from "@/lib/server_actions/thread.actions";


//Typescript interface for received props types
interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

function Comment({ threadId, currentUserImg, currentUserId }: Props) {
  
  const pathname = usePathname();              //get pathname function , to get current URL

  //shadcn form docs, useForm from react-hook-form to apply the zod validation we imported , also giving default values to the inputs
  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  //handle submit function to create thread in the DB , Note: (values) is the inputs values by "react-hook-form"
  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    //addCommentToThread server action & passing the input value , IDs
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );

    form.reset();         //after submit, Empty the comment form using rest() (react-hook-form) function  
  };

  return (
    <Form {...form}>
      <form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name='thread' render={({ field }) => (
            <FormItem className='flex w-full items-center gap-3'>
              <FormLabel>
                <Image src={currentUserImg} alt='current_user' width={48} height={48} className='rounded-full object-cover' />
              </FormLabel>
              <FormControl className='border-none bg-transparent'>
                <Input type='text' {...field} placeholder='Comment...' className='no-focus text-light-1 outline-none' />
              </FormControl>
            </FormItem>
          )} />

        <Button type='submit' className='comment-form_btn'> Reply </Button>
      </form>
    </Form>
  );
}

export default Comment;