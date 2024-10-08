import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { env } from "~/env.js";

export const rekognition = new RekognitionClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
