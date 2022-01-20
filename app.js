const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const OAuth2Data = require('./credentials.json');

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
)


app.use(bodyParser.urlencoded({ extension: 'true' }));


const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";


let authend = false;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(express.json());

app.get('/', (req, res) => {
  console.log("hdbccsjdv");
  res.render('index');
  // console.log(req.body)
  //   // console.log(url);

  //   res.render('index');
  //   console.log(req.body);
});

app.get('/upload', (req, res) => {
  // const choice = JSON.stringify(req.body);
  // // console.log(choice.query);
  // console.log(choice);
  // // res.send("HYY their madarchod");
  choice = (req.query.query);
  console.log((req));
  console.log("HYY");
  var ans = true;
  // const choice = (req.body.query);
  // console.log(typeof(choice));
  // console.log(url);
  // const choice1 = "Google Drive";
  // console.log(choice1);
  if (choice === ('Google Drive') || ans === true) {
    console.log(authend);
    if (authend === false) {
      var url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      console.log(url);
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


// })
app.get("/google/callback", function(req, res) {
  const code = req.query.code;
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
        res.redirect('/upload');

      }
    });
  }
});


app.listen((port), () => {
  console.log("listening On 5000");
})