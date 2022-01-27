var _ = require('lodash');
var request2 = require('request');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser
var parseResponse = require('./utils/parse').result
const bodyParser = require("body-parser");
var getYearFromReferenceAvis = require('./utils/year');
var host = "https://cfsmsp.impots.gouv.fr";
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/api", async (req, res) => {
  if (!req.query.numeroFiscal || !req.query.referenceAvis) {
    return res.status(400).send({
        code: 400,
        message: 'Requête incorrecte',
        explaination: 'Les paramètres numeroFiscal et referenceAvis doivent être fournis dans la requête.'
    });
  }
  const results = await svair(req.query.numeroFiscal, req.query.referenceAvis);
  res.status(200).send(results);
});

app.listen(4000, () => console.log("server is working"));

async function svair(numeroFiscal, referenceAvis) {

      var request = request2.defaults({jar: true})
      var formData = {
        'j_id_7:spi':numeroFiscal,
        'j_id_7:num_facture': referenceAvis,
        'j_id_7:j_id_l': 'Valider',
        'j_id_7_SUBMIT': 1
      }

      var formUrl = host + '/secavis/';
      var postUrl = host + '/secavis/faces/commun/index.jsf';

      const promiseOne = new Promise((resolve, reject) => {
      request(formUrl, async function (errGet, http, getBody) {
        if(errGet) return;

        var doc = new dom().parseFromString(getBody)
        viewState = xpath.select('//*[@name="javax.faces.ViewState"]/@value', doc)[0].value
        formData["javax.faces.ViewState"] = viewState;

        const promiseTwo = new Promise((resolve, reject) => {
          request.post({
            url:postUrl,
            form: formData
          }, function (err, httpResponse, body) {
            if (err) reject(err);
            const res = parseResponse(body, getYearFromReferenceAvis(referenceAvis));
            resolve(res)
          });
        })
        await promiseTwo.then(res => resolve(res)).catch(err => reject(err))

      })
    })
    const respond = await promiseOne.then(res => res, err => err)
    return respond;

};
