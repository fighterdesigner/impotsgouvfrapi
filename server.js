var express = require('express');
var Svair = require('./');

var app = express();

app.get('/api', function (req, res) {
    if (!req.query.numeroFiscal || !req.query.referenceAvis) {
        return res.status(400).send({
            code: 400,
            message: 'Requête incorrecte',
            explaination: 'Les paramètres numeroFiscal et referenceAvis doivent être fournis dans la requête.'
        });
    } else {
        Svair(req.query.numeroFiscal, req.query.referenceAvis, function (err, result) {
            if (err && err.message === 'Invalid credentials') {
                res.status(404).send({
                    code: 404,
                    message: 'Résultat non trouvé',
                    explaination: 'Les paramètres fournis sont incorrects ou ne correspondent pas à un avis'
                });
            } else {
                res.send(result);
            }
        });
    }
});

app.listen(4000, () => console.log("server is working"));
