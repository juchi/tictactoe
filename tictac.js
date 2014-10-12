"use strict";

var Player = require('./player').Player;
var Game = require('./game').Game;

var tictactoe = (function() {

    var games = [];

    function getGameInstance() {
        for (var i = 0; i < games.length; i++) {
            if (games[i].hasFreeSlot()) {
                return games[i];
            }
        }

        var game = new Game();
        games.push(game);
        return game;
    }

    var tictactoe = function() {

    };
    tictactoe.prototype.initConnection = function(connection) {
        console.log('client connection');

        connection.on('text', manageMessage);
        connection.on('close', function(){manageClose(this);});

        var player = new Player(connection);

        var game = getGameInstance();
        var accepted = game.newPlayer(player);
        if (!accepted) {
            connection.close();
        }
    };

    function manageMessage(message) {
        console.log(message);
        message = JSON.parse(message);
        var game = null;
        switch (message.type) {
            case 'move':
                game = this.player.game;
                game.processMove(message.coords, this.player);
                break;
            case 'newgame':
                game = this.player.game;
                game.start();
                break;
            default:
                break;
        }
    }

    function manageClose(connection) {
        console.log('connection close');

        connection.player.game.onPlayerQuit(connection.player);
    }

    return tictactoe;
})();

exports.tictactoe = tictactoe;
