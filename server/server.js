import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import FastSpeedtest from "fast-speedtest-api";
import { S3 } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const app = express();

console.log("hello from the server");

// const FastSpeedtest = import("fast-speedtest-api");

// let speedtest = new FastSpeedtest({
//   token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // Replace with the actual token
//   verbose: false, // Let's keep it simple
//   timeout: 10000, // 10 seconds should do
//   https: true, // Secure, as we like it
//   urlCount: 5, // Default magic number
//   bufferSize: 8, // Buffer size for the speedtest
//   unit: FastSpeedtest.UNITS.Mbps // Speed in Mbps, because we're civilized
// });



async function getInternetSpeed() {
  let speedtest = new FastSpeedtest({
    token: process.env.FAST_SPEEDTEST_API_TOKEN,
    verbose: false,
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: FastSpeedtest.UNITS.Mbps
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
app.get('/api/speedtest', async (req, res) => {
  try {
      const speed = await getInternetSpeed();
      res.json({ speed: speed });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching internet speed' });
  }
});


// Serve your static files (client-side)
app.use(express.static('public'));

// Configure AWS with environment variables
const s3Client = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.get('/generate-signed-url', async (req, res) => {
  const { filename, contentType } = req.query;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ signedUrl });
  } catch (err) {
    console.error('Error generating signed URL', err);
    res.status(500).send('Error generating signed URL');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
