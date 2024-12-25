import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { S3 } from "@aws-sdk/client-s3";
import { ContainerType } from "@aws-sdk/client-mediaconvert";
import { invokeFaceRecognition, invokeTranscodingJob } from "./transcoder";

// Create a Zod enum that matches AWS ContainerType
const ContainerTypeSchema = z.nativeEnum(ContainerType);

export const mediaRouter = createTRPCRouter({
  uploadMedia: publicProcedure
    .input(
      z.object({
        base64Data: z.string(),
        filename: z.string(),
        mimetype: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const s3Client = new S3({
        region: process.env.AWS_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const base64String = input.base64Data.replace(/^data:.+;base64,/, "");
      const buffer = Buffer.from(base64String, "base64");

      const uploadParams = {
        Bucket: process.env.AWS_MEDIA_BUCKET!,
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

  faceRecognition: publicProcedure
    .input(
      z.object({
        videoKey: z.string(),
        collectionId: z.string(),
        personName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const timestamps = await invokeFaceRecognition(
        input.videoKey,
        input.collectionId,
        input.personName
      );
      return { success: true, timestamps };
    }),

  transcodeMedia: publicProcedure
    .input(
      z.object({
        inputKey: z.string(),
        outputKey: z.string(),
        format: ContainerTypeSchema,
        timestamps: z.array(
          z.object({
            start: z.number(),
            duration: z.number()
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeTranscodingJob({
        inputKey: input.inputKey,
        outputKey: input.outputKey,
        format: input.format,
        timestamps: input.timestamps,
      });
      return { success: true, jobId: result.jobId };
    }),
});