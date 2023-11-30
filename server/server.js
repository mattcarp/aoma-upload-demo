require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const app = express();

console.log("hello from the server");

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
