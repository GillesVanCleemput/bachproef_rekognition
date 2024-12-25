import { 
  S3, 
  PutObjectCommand 
} from "@aws-sdk/client-s3";
import { 
  Rekognition, 
  Attribute, 
  CreateCollectionCommand, 
  IndexFacesCommandInput, 
  StartFaceSearchCommandInput, 
  GetFaceSearchCommandInput 
} from "@aws-sdk/client-rekognition";
import {
  ElasticTranscoder,
  CreateJobCommand
} from "@aws-sdk/client-elastic-transcoder";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

type Scene = [number, number];
type TranscoderInput = {
  Key: string;
  TimeSpan: {
    StartTime: string;
    Duration: string;
  };
};

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

      const rekognitionClient = new Rekognition({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.AWS_REGION,
      });

      const collectionId = `collection-${Date.now()}`;
      const bucketName = "poc-gillesvancleemput";

      // Step 1: Upload image to S3
      const base64String = input.base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64String, "base64");

      const uploadParams = {
        Bucket: bucketName,
        Key: input.filename,
        Body: buffer,
        ContentType: input.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Step 2: Create a Rekognition face collection
      const createCollectionParams = {
        CollectionId: collectionId,
      };

      await rekognitionClient.send(new CreateCollectionCommand(createCollectionParams));

      // Step 3: Index the uploaded face into the newly created collection
      const indexFaceParams: IndexFacesCommandInput = {
        CollectionId: collectionId,
        Image: {
          S3Object: {
            Bucket: bucketName,
            Name: input.filename,
          },
        },
        DetectionAttributes: [Attribute.ALL],
      };

      const indexResponse = await rekognitionClient.indexFaces(indexFaceParams);

      // Step 4: Start Face Search
      const startFaceSearchParams: StartFaceSearchCommandInput = {
        Video: {
          S3Object: {
            Bucket: bucketName,
            Name: "TedTalk.mp4",
          },
        },
        CollectionId: collectionId,
        NotificationChannel: {
          SNSTopicArn: process.env.AWS_SNS_TOPIC_ARN!,
          RoleArn: process.env.AWS_REKOGNITION_ROLE_ARN!,
        },
      };

      const startFaceSearchResponse = await rekognitionClient.startFaceSearch(startFaceSearchParams);

      const jobId = startFaceSearchResponse.JobId;

      // Step 5: Retrieve Face Search Results and Process Timestamps
      const getResults = async (jobId: string): Promise<any> => {
        const getParams: GetFaceSearchCommandInput = {
          JobId: jobId,
          MaxResults: 1000,
        };

        let response = await rekognitionClient.getFaceSearch(getParams);

        while (response.JobStatus === "IN_PROGRESS") {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          response = await rekognitionClient.getFaceSearch(getParams);
        }

        return response.Persons ?? [];
      };

      const faceSearchResults = await getResults(jobId!);

      // Extract timestamps from face search results
      const timestamps: number[] = [];
      faceSearchResults.forEach((person: any) => {
        if (person.FaceMatches && person.FaceMatches.length > 0) {
          timestamps.push(person.Timestamp);
        }
      });

      // Convert timestamps to scenes
      const scenes: Scene[] = [];
      let start = 0;
      let end = 0;

      timestamps.sort((a, b) => a - b).forEach((timestamp) => {
        if (start === 0) {
          start = end = timestamp;
        } else {
          if (timestamp - end > 1000) {
            if (end - start >= 1000) {
              scenes.push([start, end]);
            }
            start = 0;
          }
          end = timestamp;
        }
      });

      if (start !== 0 && end - start >= 1000) {
        scenes.push([start, end]);
      }

      // Convert scenes to Elastic Transcoder input format
      const transcoderInputs: TranscoderInput[] = scenes.map(([start, end]) => ({
        Key: "TedTalk.mp4",
        TimeSpan: {
          StartTime: (start / 1000).toString(),
          Duration: ((end - start) / 1000).toString(),
        },
      }));

      // Create Elastic Transcoder job
      const transcoderClient = new ElasticTranscoder({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.AWS_REGION,
      });

      const transcoderJob = await transcoderClient.send(
        new CreateJobCommand({
          PipelineId: process.env.AWS_TRANSCODER_PIPELINE_ID!,
          Inputs: transcoderInputs,
          Output: {
            Key: `clips-${Date.now()}.mp4`,
            PresetId: process.env.AWS_TRANSCODER_PRESET_ID!,
          },
        })
      );

      return {
        success: true,
        s3Key: input.filename,
        s3Url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${input.filename}`,
        collectionId,
        jobId,
        faceRecords: indexResponse.FaceRecords ?? [],
        faceSearchResults,
        transcoderJobId: transcoderJob.Job?.Id,
        clipKey: `clips-${Date.now()}.mp4`,
      };
    }),
});