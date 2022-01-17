const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).send("Welcome to our api");
})

app.post("/api", async (req, res) => {
 if(!req.body.numeroFiscal || !req.body.referenceDeLavis) {
     res.status(400).send("Numéro fiscal ou référence de l'avis pas trouvé");
 }
 const incinfo = await scraping(req.body.numeroFiscal, req.body.referenceDeLavis);
 res.status(201).send(incinfo);
})

let incInfo = {}
async function scraping(paramOne, paramTwo) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://cfsmsp.impots.gouv.fr/secavis");

    await page.type("form input[name='j_id_7:spi']", paramOne);
    await page.type("form input[name='j_id_7:num_facture']", paramTwo);

    await page.click("form input[name='j_id_7:j_id_l']");

    const nomElement = await page.waitForSelector('table tbody tr:nth-of-type(2) td:nth-of-type(2)');
    const domDeNaissanceElement = await page.waitForSelector('table tbody tr:nth-of-type(3) td:nth-of-type(2)');
    const drenomElement = await page.waitForSelector('table tbody tr:nth-of-type(4) td:nth-of-type(2)');
    const dateDeNaissanceElement = await page.waitForSelector('table tbody tr:nth-of-type(5) td:nth-of-type(2)');
    const adresseDeclareeElement1 = await page.waitForSelector('table tbody tr:nth-of-type(6) td:nth-of-type(2)');
    const adresseDeclareeElement2 = await page.waitForSelector('table tbody tr:nth-of-type(7) td:nth-of-type(2)');

    const nom = await nomElement.evaluate(el => el.textContent);
    const domDeNaissance = await domDeNaissanceElement.evaluate(el => el.textContent);
    const drenom = await drenomElement.evaluate(el => el.textContent);
    const dateDeNaissance = await dateDeNaissanceElement.evaluate(el => el.textContent);
    const adresseDeclaree1 = await adresseDeclareeElement1.evaluate(el => el.textContent);
    const adresseDeclaree2 = await adresseDeclareeElement2.evaluate(el => el.textContent);
    const address = adresseDeclaree1.trim() + ' ' + adresseDeclaree2.trim();

    incInfo = {
        nom: nom.trim(),
        domDeNaissance: domDeNaissance.trim(),
        drenom: drenom.trim(),
        dateDeNaissance: dateDeNaissance.trim(),
        address
    }

    await browser.close();
    return incInfo;
}

app.listen(4000, ()=> console.log("the server is running"))