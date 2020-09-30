const aws = require('aws-sdk');
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.getBucketURL = filename => {
    return `https://${secrets.AWS_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${filename}`;
}

exports.uploadToS3 = (fileFROMRequest) => {
    const {filename,mimetype, size, path} = fileFROMRequest;

    const s3UploadPromise = s3.putObject({
        Bucket: secrets.AWS_BUCKET_NAME,
        ACL: "public-read",
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    }).promise();

    return s3UploadPromise;
};