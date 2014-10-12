"use strict";

var Player = function(connection) {
    connection.player = this;
    this.connection = connection;

    this.index = 0;
    this.game = null;
    this.color = null;
    this.shape = null;
};

Player.prototype.sendData = function(message) {
    if (typeof message == 'object') {
        message = JSON.stringify(message);
    }
    this.connection.sendText(message);
};

Player.prototype.sendMessage = function(message) {
    var json = {'type':'message', 'text':message};
    this.sendData(json);
};

exports.Player = Player;