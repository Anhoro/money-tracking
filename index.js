const { default: axios } = require("axios");
const express = require("express");
const { google } = require("googleapis");
const { TELEGRAM_API_TOKEN, GOOGLE_SPREADSHEET_ID, GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, } = require("./environment.env");

//const keys = require('./moneytrackingapp-388910-4b1582db299d.json');
//const TELEGRAM_API_TOKEN = '6222506129:AAF1rU1xrIbJynApRzZ5IoIJlCHFhiWUooA';
const TELEGRAM_URI = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage`;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.engine('html', require("ejs").renderFile);

app.get('/', (request, response) =>{
    response.render('index')
})

app.get('/test', (request, response) =>{
  const answer = JSON.stringify({message: 'ok'});

  response.send(answer);
})

app.post('/new-message', async (req, res) => {
  const { message } = req.body

  const messageText = message?.text?.toLowerCase()?.trim()
  const chatId = message?.chat?.id
  if (!messageText || !chatId) {
    return res.sendStatus(400)
  }

  let responseText = 'Lala la';

  try {
    await axios.post(TELEGRAM_URI, {
      chat_id: chatId,
      text: responseText
    });

    res.send('Done');
  } catch (e) {
    console.log(e);
    res.send(e);
  }
})

app.post("/", async (req, res) => {
    const { category, money } = req.body;

console.log('request');
console.log(req);
//console.log();
//money
//category

    const auth = new google.auth.GoogleAuth({
        keyFile: "moneytrackingapp-388910-4b1582db299d.json",

        scopes: "https://www.googleapis.com/auth/spreadsheets", 
    });

    const authClientObject = await auth.getClient();

    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth,
        GOOGLE_SPREADSHEET_ID,
        range: "Sheet1!F2:G1000",
    });

    await googleSheetsInstance.spreadsheets.values.append({
        auth,
        GOOGLE_SPREADSHEET_ID,
        range: "Sheet1!F:G",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [[category, money]],
        },
    });

    res.send(readData.data);
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});