const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const { Dropbox } = require('dropbox');
const bodyParser = require('body-parser');
const OAuth2Data = require('./credentials.json');
const multer = require('multer');
const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];
const fs = require('fs');
const csrf = require('csrf');
const fetch = require('node-fetch');
const axios = require('axios')
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
)

const clientId_db = 'sb7zzvuozoq5250';
const clientSecret_db = '9bj080qyokm3by0';
const redirectUrl_db = 'http://localhost:5000/callbacks';

// console.log((redirectUrl_db));
const config = {
  clientId_db,
  clientSecret_db,
  redirectUrl_db

};
// const redirecturl = process.env.REDIRECT_URIDB;

const dbx = new Dropbox({
  clientId_db: 'sb7zzvuozoq5250',
  clientSecret_db: '9bj080qyokm3by0',
  redirectUrl_db: 'http://localhost:5000/callbacks'


});
// console.log(oAuth2Client);


app.use(bodyParser.urlencoded({ extension: 'true' }));




let authend = false;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(express.json());

var Storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./images");
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count


app.get('/', (req, res) => {
  // console.log("hdbccsjdv");
  res.render('index');

});

app.get('/upload', (req, res) => {

  choice = (req.query.query);

  if (authend == true) {
    choice = req.query.choice;
    console.log(req.query.choice);
  }

  var ans = true;

  if (choice === 'Dropbox') {
    if (authend === false) {


      var authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId_db}&redirect_uri=${redirectUrl_db}&response_type=code`;
      console.log(authUrl);
      res.render('index5', { url: authUrl });
    } else {
      res.render("success5", {

      });
    }
  }



  if (choice === ('Google Drive')) {
    console.log(authend);
    if (authend === false) {
      var url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      console.log(url);
      // return res.send(url);
      res.render('index1', { url: url });
    } else {
      console.log("ho gaya !");
      var oauth2 = google.oauth2({
        auth: oAuth2Client,
        version: "v2",
      });
      oauth2.userinfo.get(function(err, response) {
        if (err) {
          console.log(err);
        } else {
          console.log(response.data);
          name = response.data.name
          pic = response.data.picture
          res.render("success", {
            name: response.data.name,
            success: false
          });
        }
      });
    }

  }
})


app.get('/callbacks', (req, res) => {
  const code = req.query.code;
  console.log(code);
  const body = {
    clientId_db,
    clientSecret_db,
    code,
  };
  const opts = { headers: { accept: 'application/json' } };
  axios.post(`https://api.dropboxapi.com/oauth2/token/?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUrl_db}&client_id=${clientId_db}&client_secret=${clientSecret_db}`)
    .then((response) => {

      console.log(response.data);
      token = response.data.access_token;
      // eslint-disable-next-line no-console
      console.log('My token:', token);

      res.redirect(`/upload?choice=${choice}&toke=${token}`);
    })
    .catch((err) => res.status(500).json({ err: err.message }));
});

app.get("/google/callback", function(req, res) {
  const code = req.query.code;
  console.log(code);
  if (code) {
    // Get an access token based on our OAuth code
    oAuth2Client.getToken(code, function(err, tokens) {
      if (err) {
        console.log("Error authenticating");
        console.log(err);
      } else {
        console.log("Successfully authenticated");
        console.log(tokens)
        oAuth2Client.setCredentials(tokens);


        authend = true;
        // console.log(choice);
        res.redirect('/upload?choice=' + choice);

      }
    });
  }
});
app.post('/uploadfile', (req, res) => {
  upload(req, res, function(err) {
    if (err) throw err;
    console.log(req.file.path);
    const drive = google.drive({
      version: 'v3',
      auth: oAuth2Client
    })
    const filemetadata = {
      name: req.file.filename
    }
    const media = {
      minetype: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    }
    drive.files.create({
      resource: filemetadata,
      media: media,
      fields: "id"
    }, (err, file) => {
      if (err) throw err

      //deleting
      fs.unlinkSync(req.file.path);
      res.render("success", { name: name, pic: pic, success: true });
    })
  })
})


app.listen((port), () => {
  console.log("listening On 5000");
})