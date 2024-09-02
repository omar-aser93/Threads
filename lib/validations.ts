import * as z from "zod";


//Zod (Z.object) represent the data Schema we will validate , this is for user form inputs .. we can add manual {message:}
export const UserValidation = z.object({
  profile_photo: z.string().url().min(1),
  name: z.string().min(3).max(30),
  username: z.string().min(3).max(30),
  bio: z.string().min(3, { message: "Minimum 3 characters." }).max(1000, { message: "Maximum 1000 caracters." }),
});


//Zod (Z.object) represent the data Schema we will validate , this is for Thread form inputs
export const ThreadValidation = z.object({
    thread: z.string().min(3),
    accountId: z.string(),
  });


//Zod (Z.object) represent the data Schema we will validate , this is for Comment form input  
export const CommentValidation = z.object({
    thread: z.string().min(3)
});