const AWS = require('aws-sdk');
const util = require('util');
const FormData = require('form-data');
const axios = require('axios');
const busboy = require('async-busboy');
const fs = require('fs');

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

const Busboy = require("busboy");
const parseFormData = (event) => {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: {
        ...event.headers,
        "content-type":
          event.headers["Content-Type"] || event.headers["content-type"],
      },
    });
    const result = {
      files: [],
    };

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      file.on("data", (data) => {
        result.files.push({
          file: data,
          fileName: filename,
          contentType: mimetype,
        });
      });
    });
    busboy.on("field", (fieldname, value) => {
      try {
        result[fieldname] = JSON.parse(value);
      } catch (err) {
        result[fieldname] = value;
      }
    });
    busboy.on("error", (error) => reject(`Parse error: ${error}`));
    busboy.on("finish", () => {
      event.body = result;
      resolve(event);
    });
    busboy.write(event.body, event.isBase64Encoded ? "base64" : "binary");
    busboy.end();
  });
};


exports.lambdaHandler = async (event, context) => {
  console.log("lambda");
  try {
    await parseFormData(event);
    var form = new FormData();

    for (var i = 0; i < event.body.files; ++i) {
      var file = event.body.files[i];
      console.log(file);
    }
    delete event.body.files;

    Object.keys(event.body).forEach((key, index) => {
      var val = event.body[key];
      form.append(key, val);
      console.log(key, val);
    })

    var axiosResponse;
    try {
      var options = {
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        headers: {
          'accept': 'image/*',
          'X-API-Key': process.env.REMOVEBG_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          ...form.getHeaders()
        },
        data: form, //Buffer.from(form).toString('base64'),
        responseType: "arraybuffer"
      };

      axiosResponse = await axios(options);
      console.log(axiosResponse);
      axiosResponse.headers['Content-Type'] = axiosResponse.headers['content-type'];
      var response = { statusCode: axiosResponse.status, body: axiosResponse.data.toString('base64'), isBase64Encoded: true, headers: {'content-type': axiosResponse.headers[content-type]} };
      return(response);
    } catch (error) {
      console.log(error.response.data.errors[0].detail);
      return ({ statusCode: response.status ? response.status : 500, body: JSON.stringify({ message: error.response.data.errors }) });
    }
  } catch (err) {
    console.log(err.message);
    return ({ statusCode: 500, body: JSON.stringify({ message: err }) });
  }
};

/*
curl -H 'X-API-Key: n8TwaHRjiasZVkA7HGGvEp8F' -F 'image_url=https://assets.orf.at/mims/2019/44/64/crops/w=800,q=70,r=1/350290_body_112064_ticker_meghan_afp.jpg?s=cb4a24ce5bb88c1c985c5451f90e2af8c4428d7a' -f https://api.remove.bg/v1.0/removebg -o no-bg.png
curl -H 'X-API-Key: n8TwaHRjiasZVkA7HGGvEp8F' -F 'image_url=https://assets.orf.at/mims/2019/44/64/crops/w=800,q=70,r=1/350290_body_112064_ticker_meghan_afp.jpg?s=cb4a24ce5bb88c1c985c5451f90e2af8c4428d7a' -f localhost:3000/removebg -o no-bg-hin.png
*/