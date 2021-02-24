'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        event = { "body": "----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"size\"\r\n\r\npreview\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"image_file_b64\"\r\n\r\n\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"position\"\r\n\r\noriginal\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"bg_color\"\r\n\r\n\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"scale\"\r\n\r\noriginal\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"image_url\"\r\n\r\nhttps://assets.orf.at/mims/2019/44/64/crops/w=800,q=70,r=1/350290_body_112064_ticker_meghan_afp.jpg?s=cb4a24ce5bb88c1c985c5451f90e2af8c4428d7a\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"roi\"\r\n\r\n0% 0% 100% 100%\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"crop\"\r\n\r\nfalse\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"channels\"\r\n\r\nrgba\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"bg_image_url\"\r\n\r\n\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"format\"\r\n\r\nauto\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"type\"\r\n\r\nauto\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"crop_margin\"\r\n\r\n0\r\n----------------------------310838032489425938186401\r\nContent-Disposition: form-data; name=\"add_shadow\"\r\n\r\nfalse\r\n----------------------------310838032489425938186401--\r\n", "headers": { "Accept": "*/*", "Accept-Encoding": "gzip, deflate, br", "Connection": "keep-alive", "Content-Length": "1751", "Content-Type": "multipart/form-data; boundary=--------------------------310838032489425938186401", "Host": "localhost:3000", "Postman-Token": "d0ce05cf-aebe-4760-8ff0-ce4df6a2c6c9", "User-Agent": "PostmanRuntime/7.26.10", "X-Forwarded-Port": "3000", "X-Forwarded-Proto": "http" }, "httpMethod": "POST", "isBase64Encoded": false, "multiValueHeaders": { "Accept": ["*/*"], "Accept-Encoding": ["gzip, deflate, br"], "Connection": ["keep-alive"], "Content-Length": ["1751"], "Content-Type": ["multipart/form-data; boundary=--------------------------310838032489425938186401"], "Host": ["localhost:3000"], "Postman-Token": ["d0ce05cf-aebe-4760-8ff0-ce4df6a2c6c9"], "User-Agent": ["PostmanRuntime/7.26.10"], "X-Forwarded-Port": ["3000"], "X-Forwarded-Proto": ["http"] }, "multiValueQueryStringParameters": null, "path": "/hello", "pathParameters": null, "queryStringParameters": null, "requestContext": { "accountId": "123456789012", "apiId": "1234567890", "domainName": "localhost:3000", "extendedRequestId": null, "httpMethod": "POST", "identity": { "accountId": null, "apiKey": null, "caller": null, "cognitoAuthenticationProvider": null, "cognitoAuthenticationType": null, "cognitoIdentityPoolId": null, "sourceIp": "127.0.0.1", "user": null, "userAgent": "Custom User Agent String", "userArn": null }, "path": "/hello", "protocol": "HTTP/1.1", "requestId": "95f0155c-2d6a-488b-9091-8efa5183e663", "requestTime": "23/Feb/2021:12:55:36 +0000", "requestTimeEpoch": 1614084936, "resourceId": "123456", "resourcePath": "/hello", "stage": "Prod" }, "resource": "/hello", "stageVariables": null, "version": "1.0" };
        event.headers['X-Api-Key'] = 'TEST1234';
        process.env.REMOVEBG_API_KEY = 'TEST1234';
        const result = await app.lambdaHandler(event, context);

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(403);

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.errors[0].code).to.be.equal("auth_failed");
        // expect(response.location).to.be.an("string");
    });
});
