// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

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
    var response;
    try {
        const parser = require("lambda-multipart-parser");
        const result = await parser.parse(event);
        //const { content, filename, contentType } = result.files[0];

        console.log(JSON.stringify(event))

        const options = {
            host: 'api.remove.bg',
            path: '/v1.0/removebg',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.REMOVEBG_API_KEY
            }
        };

        const data = {
            image_url: result.image_url,
        };
        var response = await doPostRequest(options, data);
        return response;
    } catch (err) {
        console.log(err);
        return err;
    }
};

const https = require('https');

const doPostRequest = (options, data) => {
    return new Promise((resolve, reject) => {
        //create the request object with the callback with the result
        const req = https.request(options, (res) => {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                resolve({
                    statusCode: res.statusCode,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                    body: body
                });
            });
        });


        // handle the possible errors
        req.on('error', (e) => {
            reject(e.message);
        });

        //do the request
        req.write(JSON.stringify(data));

        //finish the request
        req.end();
    });
};