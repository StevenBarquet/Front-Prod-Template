// --------------------------------------IMPORTS------------------------------------
// Dependencies
const express = require('express');
const open = require('open');
const path = require('path');
const history = require('connect-history-api-fallback');
// -----------------------------------CONFIG-------------------------------
const app = express();
const port = process.env.PORT || 4000
const serveStatic = express.static(path.join(__dirname, 'dist')); // serve static files
const logs = false;
// -----------------------------------MIDDLEWARES-------------------------------
const optionsHystory = logs ? { verbose: true } : {};
app.use(serveStatic);
app.use(history(optionsHystory));
app.use(serveStatic);
// -----------------------------------ROUTES-------------------------------
app.get('/', (req, res) => {
  res.render(__dirname + '/dist/index.html');
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
