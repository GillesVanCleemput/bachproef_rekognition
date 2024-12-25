import {
    MediaConvertClient,
    CreateJobCommand,
    ContainerType
  } from "@aws-sdk/client-mediaconvert";
  import {
    RekognitionClient,
    StartFaceSearchCommand,
    GetFaceSearchCommand
  } from "@aws-sdk/client-rekognition";
  
  interface TimeStamp {
    start: number;
    duration: number;
  }
  
  interface TranscodingJobInput {
    inputKey: string;
    outputKey: string;
    format: ContainerType;
    timestamps: TimeStamp[];
  }
  
  export const invokeFaceRecognition = async (
    videoKey: string,
    collectionId: string,
    personName: string
  ): Promise<TimeStamp[]> => {
    const rekognitionClient = new RekognitionClient({
      region: process.env.AWS_REGION!
    });
  
    const startCommand = new StartFaceSearchCommand({
      Video: {
        S3Object: {
          Bucket: process.env.AWS_MEDIA_BUCKET!,
          Name: videoKey
        }
      },
      CollectionId: collectionId,
    });
  
    const startResponse = await rekognitionClient.send(startCommand);
    const jobId = startResponse.JobId!;
    const timestamps: TimeStamp[] = [];
    let nextToken: string | undefined;
  
    do {
      const searchCommand = new GetFaceSearchCommand({
        JobId: jobId,
        NextToken: nextToken
      });
      
      const searchResponse = await rekognitionClient.send(searchCommand);
  
      for (const person of searchResponse.Persons ?? []) {
        if (person.FaceMatches?.some(
          (match) => match.Face?.ExternalImageId === personName
        )) {
          const timestamp = person.Timestamp!;
          timestamps.push({
            start: timestamp,
            duration: 1000
          });
        }
      }
  
      nextToken = searchResponse.NextToken;
    } while (nextToken);
  
    return timestamps;
  };
  
  export const invokeTranscodingJob = async ({
    inputKey,
    outputKey,
    format,
    timestamps,
  }: TranscodingJobInput) => {
    const mediaconvertClient = new MediaConvertClient({
      region: process.env.AWS_REGION!,
      endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT!,
    });
  
    const jobCommand = new CreateJobCommand({
      Role: process.env.AWS_MEDIACONVERT_ROLE_ARN!,
      Settings: {
        TimecodeConfig: {
          Source: "ZEROBASED"
        },
        Inputs: timestamps.map((ts) => ({
          FileInput: `s3://${process.env.AWS_MEDIA_BUCKET!}/${inputKey}`,
          TimecodeSource: "ZEROBASED",
          VideoSelector: {},
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT"
            }
          },
          TimeSpan: {
            StartTime: `${ts.start / 1000}`,
            Duration: `${ts.duration / 1000}`
          }
        })),
        OutputGroups: [
          {
            Name: "File Group",
            OutputGroupSettings: {
              Type: "FILE_GROUP_SETTINGS",
              FileGroupSettings: {
                Destination: `s3://${process.env.AWS_MEDIA_BUCKET!}/${outputKey}/`
              }
            },
            Outputs: [
              {
                ContainerSettings: {
                  Container: format
                },
                VideoDescription: {
                  CodecSettings: {
                    Codec: "H_264",
                    H264Settings: {
                      MaxBitrate: 5000000,
                      RateControlMode: "QVBR",
                      SceneChangeDetect: "TRANSITION_DETECTION"
                    }
                  },
                  Width: 1920,
                  Height: 1080
                },
                AudioDescriptions: [
                  {
                    AudioSourceName: "Audio Selector 1",
                    CodecSettings: {
                      Codec: "AAC",
                      AacSettings: {
                        Bitrate: 96000,
                        CodingMode: "CODING_MODE_2_0",
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                Extension: format.toLowerCase()
              }
            ]
          }
        ]
      }
    });
  
    const response = await mediaconvertClient.send(jobCommand);
    return { jobId: response.Job?.Id };
  };