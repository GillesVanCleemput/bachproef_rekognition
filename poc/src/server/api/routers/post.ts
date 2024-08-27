import { randomUUID } from "crypto";
import { env } from "process";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mocked DB
interface Post {
  id: number;
  name: string;
}
const posts: Post[] = [
  {
    id: 1,
    name: "Hello World",
  },
];

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const post: Post = {
        id: posts.length + 1,
        name: input.name,
      };
      posts.push(post);
      return post;
    }),

  getLatest: publicProcedure.query(() => {
    return posts.at(-1) ?? null;
  }),

  // createUploadUrl: publicProcedure
  //   .input(
  //     z.object({
  //       fileType: z.string(),
  //       fileName: z.string(),
  //     }),
  //   )
  //   .mutation(
  //     async ({
  //       ctx: { s3 },
  //       input: {
  //         fileType,
  //         fileName,
  //       },
  //     }) => {
  //       const id = randomUUID();
  //       const extension = fileType.split("/")[1];
  //       const filename_without_extension = fileName.split(".")[0];

  //       let privacy = true;

  //       if (!extension) throw new Error("Invalid file type");

  //       const key = `${filename_without_extension}.${extension}`;
  //       const post = await createPresignedPost(s3, {
  //         Bucket: env.AWS_BUCKET,
  //         Key: key,
  //         Fields: {
  //           key: key,
  //           "Content-Type": fileType,
  //         },
  //         Expires: 600,
  //       });

  //     },
  //   ),
});
