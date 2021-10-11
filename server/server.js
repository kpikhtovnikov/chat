const express = require('express');
const app = express();
const http = require('http');;
const port = process.env.PORT || 8080;
const signalling = require('./signalling');

const server = http.createServer(app);

signalling(server);

//обслуживание html
app.get('/', function(req, res) {
    res.sendfile('index.html');
 });

server.listen(port, () => {
    console.log(`Server start on port ${port}`);
});