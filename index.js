// --------------------------------------IMPORTS------------------------------------
// Dependencies
const express = require('express');
const open = require('open');
// Middlewares
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
// -----------------------------------CONFIG-------------------------------
const app = express();
const port = process.env.PORT || 4000

// -----------------------------------MIDDLEWARES-------------------------------
app.use(express.json()); // needed to read req.body
app.use(helmet()); // for security
app.use(cors()); // for security
app.use(express.static(path.join(__dirname, 'dist'))); // serve static files

// -----------------------------------ROUTES-------------------------------
app.get('/*', (req, res) => {
  // console.log('Path: ', req.path);
  res.sendFile(__dirname + '/dist/index.html');
});

// -----------------------------------SSL-------------------------------
const http = require('http');
const https = require('https');
const fs = require('fs');
const sslPath = process.env.SSL_PATH || null

let optionsSSL

try {
  if(sslPath)
    optionsSSL = {
      cert: fs.readFileSync(`${sslPath}/fullchain.pem`),
      key: fs.readFileSync(`${sslPath}/privkey.pem`)
    };
  else
    optionsSSL = {
      cert: fs.readFileSync(`./self-signed-certs/certificate.crt`),
      key: fs.readFileSync(`./self-signed-certs/certificate.key`)
    };
  console.log('exito cert: ', optionsSSL);
} catch (error) {
  optionsSSL = {};
  console.log('fallo cert: ', error);
}

const trySSL = process.env.USE_SSL || false // Set use of https from enviroment

const server = trySSL ? https : http
const options = trySSL ? optionsSSL : {}

// -----------------------------------SERVER-------------------------------
server
  .createServer(options, app)
  .listen(port, () => {
    console.log('https ', trySSL, ' listening to port ' + port + '...')
    // Open browser on local tests
    if( !sslPath && trySSL )
      open(`https://localhost:${port}/`);
    else if( !trySSL )
      open(`http://localhost:${port}/`);
  });
