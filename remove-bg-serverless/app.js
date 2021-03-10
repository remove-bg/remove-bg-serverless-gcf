const AWS = require('aws-sdk');
const util = require('util');
const FormData = require('form-data');
const axios = require('axios');
const busboy = require('busboy');

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
    console.log("lambda");
    try {
        if (Object.entries(event).length === 0) {
            console.log("no event data");
            return new Error("no event data");
        }
        var contentType = event.headers['Content-Type'] || event.headers['content-type'];
        var bb = new busboy({ headers: { 'content-type': contentType } });

        bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
            console.log('File [%s]: filename=%j; encoding=%j; mimetype=%j', fieldname, filename, encoding, mimetype);

            file
                .on('data', data => console.log('File [%s] got %d bytes', fieldname, data.length))
                .on('end', () => console.log('File [%s] Finished', fieldname));
        })
            .on('field', (fieldname, val) => console.log('Field [%s]: value: %j', fieldname, val))
            .on('finish', () => {
                console.log('Done parsing form!');
                context.succeed({ statusCode: 200, body: 'all done', headers });
            })
            .on('error', err => {
                console.log('failed', err);
                context.fail({ statusCode: 500, body: err, headers });
            });

        bb.end(event.body);

        const parser = require("lambda-multipart-parser");
        const parsedEventData = await parser.parse(event, true);
        if (parsedEventData.files) {
            var err = "No file uploads supported";
            console.log(err);
            return err;
        }
        const { content, filename, contentType2 } = result.files[0];

        console.log(Object.keys(parsedEventData));

        var form = new FormData();
        form.append("image_url", signedUrl);

        const options = {
            url: 'https://api.remove.bg/v1.0/removebg',
            method: 'POST',
            headers: {
                'Content-Type': 'application/form-data',
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