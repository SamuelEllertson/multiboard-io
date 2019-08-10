var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//express routing
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/client', function (req, res) {
    res.sendFile(__dirname + '/client');
});

app.get('/shared', function (req, res) {
    res.sendFile(__dirname + '/shared');
});

app.use('/client', express.static(__dirname + '/client'));
app.use('/shared', express.static(__dirname + '/shared'));

var port = process.env.PORT || 3000;
server.listen(port);

exports.express = express;
exports.app = app;
exports.server = server;
exports.io = io;

module.exports = exports;