const AWS = require('aws-sdk');
const util = require('util');
const FormData = require('form-data');
const axios = require('axios');

// get reference to S3 client
const s3 = new AWS.S3();

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    console.log("Reading options from event:\n", util.inspect(event, { depth: 5 }));
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstBucket = "removebg-dest";
    const dstKey = srcKey.replace("-source", "-dest");

    // Infer the image type from the file suffix.
    const typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.log("Could not determine the image type.");
        return;
    }

    console.log(srcBucket);
    console.log(srcKey);

    // Check that the image type is supported  
    const imageType = typeMatch[1].toLowerCase();
    if (imageType != "jpg" && imageType != "png") {
        console.log(`Unsupported image type: ${imageType}`);
        return;
    }

    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: srcBucket,
        Key: srcKey,
        Expires: 3600
    });

    console.log("Presigned URL:", signedUrl)

    try {
        const params = {
            Bucket: srcBucket,
            Key: srcKey
        };
        var origimage = await s3.getObject(params).promise();

    } catch (error) {
        console.log(error);
        return;
    }  

    try {
        /*const parser = require("lambda-multipart-parser");
        const parsedEventData = await parser.parse(event);
        if (parsedEventData.files) {
            var err = "No file uploads supported";
            console.log(err);
            return err;
        }
        //const { content, filename, contentType } = result.files[0];

        console.log(Object.keys(parsedEventData));*/

        var form = new FormData();
        form.append("image_url", signedUrl);

        const options = {
            url: 'https://api.remove.bg/v1.0/removebg',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Api-Key': process.env.REMOVEBG_API_KEY
            },
            data: form
        };
        console.log('options');
        console.log(options);
        var response;
        try {
            response = await axios(options);
        } catch (error) {
            console.log(error.response);
            console.log(error.response.data.errors[0]);
            return error.response;
        }

        // Upload the processed image to the -dest bucket
        try {
            const destparams = {
                Bucket: dstBucket,
                Key: dstKey,
                Body: response,
                ContentType: "image"
            };

            const putResult = await s3.putObject(destparams).promise();
            console.log(putResult);

        } catch (error) {
            console.log(error);
            return;
        }

        console.log('Successfully removed background from ' + srcBucket + '/' + srcKey +
            ' and uploaded to ' + dstBucket + '/' + dstKey);

        return "Success";
    } catch (err) {
        console.log(err);
        return err;
    }
};