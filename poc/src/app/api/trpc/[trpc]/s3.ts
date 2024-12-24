import { S3 } from 'aws-sdk';
import * as fs from 'fs';



export const uploadFile = async (file: any): Promise<any | Error> => {
  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: "poc-gillesvancleemput",
    Key: file.filename,
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(uploadParams).promise();

  return result;
};

export default uploadFile;