var multer = require("multer");
var { S3Client } = require("@aws-sdk/client-s3");
var multerS3 = require("multer-s3");
var uuid = require("uuid").v4;
require("dotenv").config();

var s3 = new S3Client({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 region: process.env.AWS_REGION,
});

var upload = multer({
 storage: multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
   console.log("file", file.originalname);
   cb(null, uuid() + file.originalname);
  },
 }),
});

module.exports = { upload };
