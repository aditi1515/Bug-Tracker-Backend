var { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

var s3 = new S3Client({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
 region: process.env.AWS_REGION,
});



async function deleteImagesFromS3(links) {

 if (!Array.isArray(links)) {
  links = [links];
 }

 try {
  var deletePromises = links.map((link) => {

   var key = link.split("amazonaws.com/")[1];
   return s3.send(
    new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key })
   );
  });

  await Promise.all(deletePromises);
  console.log("Images deleted successfully");
 } catch (error) {
  console.error("Error deleting images from S3:", error);
 }
}

module.exports = { deleteImagesFromS3 };
