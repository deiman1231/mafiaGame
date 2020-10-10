const HTTPS_PORT = 443; //default port for https is 443
const HTTP_PORT = 80; //default port for http is 80


const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const { v4: uuidV4 } = require('uuid');
const express = require('express');
const app = express();
// based on examples at https://www.npmjs.com/package/ws 
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

app.set('view engine', 'ejs');
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.render('index', { roomId: ''});
})

app.get('/:room', (req, res) => {
  res.render('index', { roomId: req.params.room })
  console.log(req.params.room)
  start();
})

// ----------------------------------------------------------------------------------------
const httpServer = http.createServer(app);
const httpsServer = https.createServer(serverConfig, app);

httpServer.listen(HTTP_PORT);
httpsServer.listen(HTTPS_PORT);

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });

  ws.on('error', () => ws.terminate());
});

wss.broadcast = function (data) {
  this.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

console.log('Server running.');

// ----------------------------------------------------------------------------------------

// Separate server to redirect from http to https

function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


