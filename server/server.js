import dotenv from "dotenv";
dotenv.config();
import express from "express";
import FastSpeedtest from "fast-speedtest-api";

// import {
//   S3,
//   CreateMultipartUploadCommand,
//   PutObjectCommand,
//   GetUploadPartCommand,
//   CompleteMultipartUploadCommand
// } from '@aws-sdk/client-s3';

// import AWS from "@aws-sdk/client-s3";
// const {
//   S3,
//   CreateMultipartUploadCommand,
//   PutObjectCommand,
//   UploadPartCommand,
//   CompleteMultipartUploadCommand,
// } = AWS;


import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize the S3 client
// const s3Client = new S3({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

const app = express();
app.use(express.json());

console.log("hello from the server");

// Serve your static files (client-side)
app.use(express.static("public"));

// app.post("/complete-multipart-upload", async (req, res) => {
//   const { filename, uploadId, parts } = req.body; // Ensure you receive these details from the client

//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: filename,
//     UploadId: uploadId,
//     MultipartUpload: {
//       Parts: parts, // An array of parts, including ETags and part numbers
//     },
//   };

//   try {
//     const command = new CompleteMultipartUploadCommand(params);
//     const data = await s3Client.send(command);
//     res.json({ message: "Upload complete", data });
//   } catch (error) {
//     console.error("Error completing multipart upload:", error);
//     res.status(500).send("Error completing multipart upload");
//   }
// });

app.post("/complete-multipart-upload", async (req, res) => {
  const { filename, uploadId, parts } = req.body;

  // Ensure the parts are properly formatted
  const formattedParts = parts.map(part => ({
    ETag: part.ETag,
    PartNumber: part.PartNumber
  }));

  // Log the formatted parts array to check structure
  console.log("Formatted parts array for completion:", formattedParts);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    UploadId: uploadId,
    MultipartUpload: { Parts: formattedParts }
  };

  try {
    const command = new CompleteMultipartUploadCommand(params);
    const data = await s3Client.send(command);
    res.json({ message: "Upload complete", data });
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    res.status(500).send("Error completing multipart upload");
  }
});


app.post("/get-signed-url-for-chunk", async (req, res) => {
  const { fileName, partNumber, uploadId } = req.body;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    PartNumber: partNumber,
    UploadId: uploadId,
  };

  try {
    const command = new UploadPartCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ signedUrl });
  } catch (err) {
    console.error("Error generating signed URL for chunk", err);
    res.status(500).send("Error generating signed URL for chunk");
  }
});

app.post("/start-multipart-upload", async (req, res) => {
  const { filename, contentType } = req.body;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    ContentType: contentType,
  };

  try {
    const command = new CreateMultipartUploadCommand(params);
    const data = await s3Client.send(command);
    res.json({ uploadId: data.UploadId });
  } catch (err) {
    console.error("Error starting multipart upload", err);
    res.status(500).send("Error starting multipart upload");
  }
});

async function getInternetSpeed() {
  let speedtest = new FastSpeedtest({
    token: process.env.FAST_SPEEDTEST_API_TOKEN,
    verbose: false,
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: FastSpeedtest.UNITS.Mbps,
  });

  try {
    const speed = await speedtest.getSpeed();
    console.log(`Internet speed: ${speed} Mbps`);
    return speed;
  } catch (err) {
    console.error(`Error getting internet speed: ${err.message}`);
    return null;
  }
}

export { getInternetSpeed };

// Define a route to fetch internet speed
app.get("/api/speedtest", async (req, res) => {
  try {
    const speed = await getInternetSpeed();
    res.json({ speed: speed });
  } catch (error) {
    res.status(500).json({ error: "Error fetching internet speed" });
  }
});

// Serve your static files (client-side)
app.use(express.static("public"));

app.get("/generate-signed-url", async (req, res) => {
  const { filename, contentType } = req.query;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    res.json({ signedUrl });
  } catch (err) {
    console.error("Error generating signed URL", err);
    res.status(500).send("Error generating signed URL");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
