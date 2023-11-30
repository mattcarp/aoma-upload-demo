require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const app = express();

console.log("hello from the server");

const FastSpeedtest = require("fast-speedtest-api");

let speedtest = new FastSpeedtest({
  token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // Replace with the actual token
  verbose: false, // Let's keep it simple
  timeout: 10000, // 10 seconds should do
  https: true, // Secure, as we like it
  urlCount: 5, // Default magic number
  bufferSize: 8, // Buffer size for the speedtest
  unit: FastSpeedtest.UNITS.Mbps // Speed in Mbps, because we're civilized
});

speedtest.getSpeed().then(speed => {
  console.log(`Your internet speed is: ${speed} Mbps. Lightning fast, isn't it?`);
}).catch(e => {
  console.error(`Error: ${e.message}. Maybe the hamsters powering your internet took a break.`);
});

function getInternetSpeed() {
    return speedtest.getSpeed().then(speed => speed).catch(e => console.error(e.message));
}

module.exports = { getInternetSpeed };


// Serve your static files (client-side)
app.use(express.static('public'));

// Configure AWS with environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});
console.log("AWS.config: ", AWS.config);

const s3 = new AWS.S3();

app.get('/generate-signed-url', (req, res) => {
  const params = {
    Bucket: 'aoma-demo-bucket',
    Key: req.query.filename,
    Expires: 1800, // The URL will expire in 1800 seconds
	ContentType: req.query.contentType
  };

  console.log("params: ", params);

  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      console.error('Error generating signed URL', err);
      return res.status(500).send(err);
    }
	console.log('Generated signed URL:', url);
    res.json({ signedUrl: url });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
