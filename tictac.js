"use strict";

var tictactoe = function() {

    var games = [];

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

    var Game = function() {
        this.indexes = [0, 1];
        this.colors = ['blue', 'red'];
        this.shapes = ['cross', 'circle'];
        this.grid = [];
        this.nextTurn = -1;
        this.running = false;

        this.players = [];
    };
    Game.prototype.newPlayer = function(player) {
        if (this.indexes.length == 0) {
            return false;
        }
        var index = this.indexes.shift();

        player.index = index;
        player.game = this;
        player.color = this.colors.shift();
        player.shape = this.shapes.shift();
        this.players[index] = player;

        var initMessage = {'type':'connection', 'index':index, 'players':this.getPlayersData()};
        player.sendData(initMessage);
        this.broadcast({'type':'newplayer', 'index':index, 'players':this.getPlayersData()});

        if (this.indexes.length == 0) {
            this.start();
        } else {
            this.broadcast({'type':'message', 'text':'Waiting for another player...'});
        }

        return true;
    };

    Game.prototype.getPlayersData = function() {
        var data = [];
        for (var i in this.players) {
            if (this.players[i] != null && this.players.hasOwnProperty(i)) {
                data[i] = {color:this.players[i].color, shape:this.players[i].shape};
            }
        }
        return data;
    };

    Game.prototype.start = function() {
        this.running = true;
        this.nextTurn = 0;
        this.grid = [[-1, -1, -1], [-1, -1, -1], [-1, -1,-1]];

        var message = {'type':'newgame', 'next':this.nextTurn};
        this.broadcast(message);
    };

    Game.prototype.hasFreeSlot = function() {
        return this.indexes.length > 0;
    };

    Game.prototype.processMove = function (coords, player)
    {
        if (!this.running) {
            player.sendMessage('The game did not begin yet.');
            return;
        }
        if (this.nextTurn != player.index) {
            player.sendMessage('Its not your turn to play.');
            return;
        }

        if (this.grid[coords.x][coords.y] == -1) {
            this.grid[coords.x][coords.y] = player.index;
            this.nextTurn++;
            this.nextTurn %= 2;

            var win = checkWin(this.grid);
            var message = {
                'type':'move',
                'coords':coords,
                'index':player.index,
                'next':this.nextTurn,
                'win':win
            };
            this.broadcast(message);

            if (win != -1) {
                this.endGame('Player '+win+' win.');
            }

        } else {
            player.sendMessage('Move is not allowed');
        }
    };

    Game.prototype.onPlayerQuit = function(player) {
        var index = player.index;
        player.game = null;

        this.colors.push(player.color);
        this.shapes.push(player.shape);

        this.players[index] = null;

        this.indexes.push(index);

        this.endGame('The player '+ index + 'quit the game.');
    };

    Game.prototype.endGame = function(reason) {
        this.nextTurn = -1;
        this.running = false;

        this.broadcast({'type':'endgame', 'text':reason});
    };
    Game.prototype.broadcast = function(message) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) {
                this.players[i].sendData(message);
            }
        }
    };

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

    this.initConnection = function(connection) {
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

    function checkWin(grid)
    {
        var current = -1;
        // check columns
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid.length; j++) {
                if (grid[i][j] == -1) {
                    current = -1;
                    break;
                }
                if (grid[i][j] == current || current == -1) {
                    current = grid[i][j];
                    if (j == grid.length - 1) {
                        return current;
                    }
                } else {
                    current = -1;
                    break;
                }
            }
        }

        // check lines
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid.length; j++) {
                if (grid[j][i] == -1) {
                    current = -1;
                    break;
                }
                if (grid[j][i] == current || current == -1) {
                    current = grid[j][i];
                    if (j == grid.length - 1) {
                        return current;
                    }
                } else {
                    current = -1;
                    break;
                }
            }
        }

        // check diags
        for (var i = 0; i < grid.length; i++) {
            if (grid[i][i] == -1) {
                current = -1;
                break;
            }
            if (grid[i][i] == current || current == -1) {
                current = grid[i][i];
                if (i == grid.length - 1) {
                    return current;
                }
            } else {
                current = -1;
                break;
            }
        }
        for (var i = 0; i < grid.length; i++) {
            var j = grid.length - i - 1;
            if (grid[i][j] == -1) {
                break;
            }
            if (grid[i][j] == current || current == -1) {
                current = grid[i][j];
                if (i == grid.length - 1) {
                    return current;
                }
            } else {
                current = -1;
                break;
            }
        }

        return -1;
    }
};

exports.tictactoe = tictactoe;
