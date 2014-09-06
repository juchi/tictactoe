"use strict";

var http = require('http'),
    ws = require('nodejs-websocket'),
    server = require('./server'),
    tictac = require('./tictac');

http.createServer(server.onRequest).listen(8080);

var t = new tictac.tictactoe();
var wsserver = ws.createServer(function(connection) {
    t.initConnection(connection);
});
wsserver.listen(8081);
