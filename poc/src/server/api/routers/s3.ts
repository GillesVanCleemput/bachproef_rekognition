import { createTRPCRouter, publicProcedure } from "../trpc";
import { S3 } from '@aws-sdk/client-s3'; // AWS SDK v3
import { z } from "zod";

export const s3Router = createTRPCRouter({
  uploadFile: publicProcedure
    .input(
      z.object({
        base64Data: z.string(),
        filename: z.string(),
        mimetype: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const s3Client = new S3({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.AWS_REGION,
      });

      const base64String = input.base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64String, "base64");

      const uploadParams = {
        Bucket: "poc-gillesvancleemput",
        Key: input.filename,
        Body: buffer,
        ContentType: input.mimetype,
      };

      await s3Client.putObject(uploadParams);

      return {
        success: true,
        key: input.filename,
        url: `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${input.filename}`,
      };
    }),
});
