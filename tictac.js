"use strict";

var tictactoe = function() {

    var games = [];

    var Player = function(connection) {
        connection.player = this;

        this.index = 0;
        this.game = null;

        this.sendMessage = function(message) {
            connection.sendText(message);
        };
    };

    var Game = function() {
        var indexes = [0, 1];
        var colors = ['blue', 'red'];
        var shapes = ['cross', 'circle'];
        var grid = [];
        var nextTurn = -1;
        var running = false;

        this.players = [];
        var playersData = [];

        this.newPlayer = function(player) {
            if (indexes.length == 0) {
                return false;
            }
            var index = indexes.shift();

            player.index = index;
            player.game = this;
            this.players[index] = player;
            playersData[index] = {'color':colors.shift(), 'shape':shapes.shift()};

            var initMessage = {'type':'connection', 'index':index, 'players':playersData};
            player.sendMessage(JSON.stringify(initMessage));
            broadcast(JSON.stringify({'type':'newplayer', 'index':index, 'players':playersData}));

            if (indexes.length == 0) {
                this.start();
            } else {
                broadcast(JSON.stringify({'type':'message', 'text':'Waiting for another player...'}));
            }

            return true;
        };

        this.start = function() {
            running = true;
            nextTurn = 0;
            grid = [[-1, -1, -1], [-1, -1, -1], [-1, -1,-1]];

            var message = {'type':'newgame', 'next':nextTurn};
            message = JSON.stringify(message);
            broadcast(message);
        };

        this.hasFreeSlot = function() {
            return indexes.length > 0;
        };

        this.processMove = function (coords, player)
        {
            if (!running) {
                var message = {'type':'message','text':'The game did not begin yet.'};
                message = JSON.stringify(message);
                player.sendMessage(message);
                return;
            }
            if (nextTurn != player.index) {
                var message = {'type':'message','text':'Its not your turn to play.'};
                message = JSON.stringify(message);
                player.sendMessage(message);
                return;
            }

            if (grid[coords.x][coords.y] == -1) {
                grid[coords.x][coords.y] = player.index;
                nextTurn++;
                nextTurn %= 2;

                var win = checkWin(grid);
                var message = {
                    'type':'move',
                    'coords':coords,
                    'index':player.index,
                    'next':nextTurn,
                    'win':win
                };
                message = JSON.stringify(message);
                broadcast(players, message);

                if (win != -1) {
                    running = false;
                }

            } else {
                var message = {'type':'message','text':'Move is not allowed'};
                message = JSON.stringify(message);
                player.sendMessage(message);
            }
        };

        this.onPlayerQuit = function(player) {
            var index = player.index;
            player.game = null;

            colors.push(playersData[index].color);
            shapes.push(playersData[index].shape);

            this.players[index] = null;
            this.playersData[index] = null;

            indexes.push(index);
            nextTurn = -1;
            running = false;
        };
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
        connection.on('close', manageClose);

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
        switch (message.type) {
            case 'move':
                var game = this.player.game;
                game.processMove(message.coords, this.player);
                break;
            default:
                break;
        }
    }

    function manageClose() {
        console.log('connection close');

        this.player.game.onPlayerQuit(this.player);
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

    function broadcast(message)
    {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) {
                this.players[i].sendMessage(message);
            }
        }
    }
}

exports.tictactoe = tictactoe;
