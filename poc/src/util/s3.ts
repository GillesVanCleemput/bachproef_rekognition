import { S3 } from "@aws-sdk/client-s3";
import { env } from "~/env.js";

export const s3 = new S3({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
