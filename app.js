const util = require('util');
const FormData = require('form-data');
const axios = require('axios');
const busboy = require('async-busboy');
const fs = require('fs');

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



/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = async (req, res) => {
 console.log("lambda");
  try {
    await parseFormData(req);
    var form = new FormData();

    for (var i = 0; i < req.body.files; ++i) {
      var file = req.body.files[i];
      console.log(file);
    }
    delete req.body.files;

    Object.keys(req.body).forEach((key, index) => {
      var val = req.body[key];
      form.append(key, val);
      console.log(key, val);
    })

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
        data: form,
        responseType: "arraybuffer"
      };

      var axiosResponse = await axios(options);

      res.status(axiosResponse.status).set('content-type', axiosResponse.headers['content-type']).send(axiosResponse.data);
      

      //var response = { statusCode: axiosResponse.status, body: axiosResponse.data, headers: {'content-type': axiosResponse.headers['content-type']} };
      //return(response);
    } catch (error) {
      var msg = error.message ? error.messsage : error.response.data.errors[0].detail;
      console.log(msg);
      return ({ statusCode: error.status ? error.status : 500, body: JSON.stringify({ message: msg }) });
    }
  } catch (err) {
    console.log(err.message);
    return ({ statusCode: 500, body: JSON.stringify({ message: err }) });
  }  
};
