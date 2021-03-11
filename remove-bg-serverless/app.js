const AWS = require('aws-sdk');
const util = require('util');
const FormData = require('form-data');
const axios = require('axios');
const busboy = require('busboy');
const fs = require('fs');

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
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

        var form = new FormData();
        bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
            console.log('File [%s]: filename=%j; encoding=%j; mimetype=%j', fieldname, filename, encoding, mimetype);

            file
                .on('data', data => {
                    console.log('File [%s] got %d bytes', fieldname, data.length);
                })
                .on('end', () => {
                    console.log('File [%s] Finished', fieldname);
                });
        })
            .on('field', (fieldname, val) => {
                form.append(fieldname, val);
                console.log(fieldname, val);
            })
            .on('finish', () => {
                console.log('Done parsing form!');
                //context.succeed({ statusCode: 200, body: 'all done', headers });
            })
            .on('error', err => {
                console.log('failed', err);
                context.fail({ statusCode: 500, body: err, headers });
            });

        bb.end(event.body);

        const parser = require("lambda-multipart-parser");
        const parsedEventData = await parser.parse(event, true);
        if (parsedEventData.files.length>0) {
            var err = "No file uploads supported";
            console.log(err);

            const { content, filename, contentType2 } = parsedEventData.files[0];
            console.log(Object.keys(parsedEventData));
    
            return err;
        }

        var headers = form.getHeaders();
        headers['X-Api-Key'] = process.env.REMOVEBG_API_KEY;

        const options = {
            url: 'https://api.remove.bg/v1.0/removebg',
            method: 'post',
            headers: headers,
            data: form,
            responseType: "utf8"
        };
        console.log('options');
        console.log(options);
        var axiosResponse;
        try {
            axiosResponse = await axios(options);
            console.log('response');
            console.log(axiosResponse.data);
            axiosResponse.headers['Content-Type'] = axiosResponse.headers['content-type'];
            var response = {statusCode: axiosResponse.status, body: Buffer.from(axiosResponse.data).toString('base64'), headers:axiosResponse.headers, isBase64Encoded: true};
            context.succeed(response);
            return;
        } catch (error) {
            console.log('error');
            console.log(error.response.data.errors[0].detail);
            context.fail({ statusCode: 500, body: error.response.data.errors[0].detail, headers });
            return;
        }
    } catch (err) {
        console.log('error');
        console.log(err.message);
        context.fail({ statusCode: 500, body: err, headers });
    }
};