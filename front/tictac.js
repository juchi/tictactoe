(function() {
"use strict";
var tictactoe = function(canvas) {
    this.init(canvas);
};
tictactoe.prototype = {
    canvas: null,
    ctx: null,
    connection: null,
    cellSize: 50,
    players: [],
    playerIndex: -1,

    init: function(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        canvas.width = this.cellSize * 3;
        canvas.height = this.cellSize * 3;

        $(this.canvas).on('click', this.onClick.bind(this));
        $('#new-game').on('click', this.playAgain.bind(this));

        this.initConnection();
    },

    initConnection: function() {
        var that = this;
        var connection = new WebSocket('ws://'+location.hostname+':8081');

        connection.onopen = function() {
            $('#conn-status').text('Connected');
        };

        connection.onclose = function() {
            $('#conn-status').text('Disconnected');
        };

        connection.onmessage = function(message){
            console.log(message.data);
            message = JSON.parse(message.data);
            var action = message.type;
            try {
                that.runAction(action, message);
            } catch (e) {
                console.log(e);
            }
        };
        this.connection = connection;

    },

    onClick: function(event) {
        var x = event.pageX - this.canvas.offsetLeft;
        var y = event.pageY - this.canvas.offsetTop;
        var cellCoords = this.getCellFromPosition({'x':x, 'y':y});

        var json = {'type': 'move','coords': cellCoords};
        json = JSON.stringify(json);
        this.connection.send(json);
    },

    playAgain: function(event) {
        var message = {'type':'newgame'};
        this.connection.send(JSON.stringify(message));
    },

    cleanCanvas: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawGrid: function() {
        this.cleanCanvas();

        var ctx = this.ctx;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.cellSize, 0);
        ctx.lineTo(this.cellSize, this.cellSize * 3);
        ctx.stroke();
        ctx.moveTo(this.cellSize * 2, 0);
        ctx.lineTo(this.cellSize * 2, this.cellSize * 3);
        ctx.stroke();

        ctx.moveTo(0, this.cellSize);
        ctx.lineTo(this.cellSize * 3, this.cellSize);
        ctx.stroke();
        ctx.moveTo(0, this.cellSize * 2);
        ctx.lineTo(this.cellSize * 3, this.cellSize * 2);
        ctx.stroke();

    },

    getCellFromPosition: function(pos) {
        var coords = {};
        coords.x = Math.floor(pos.x / this.cellSize);
        coords.y = Math.floor(pos.y / this.cellSize);
        return coords;
    },

    getTopLeftPosition: function(coords) {
        var pos = {};
        pos.x = coords.x * this.cellSize;
        pos.y = coords.y * this.cellSize;
        return pos;
    },

    drawPiece: function(coords, playerIndex) {
        var shape = this.players[playerIndex].shape;
        var position = this.getTopLeftPosition(coords);
        var color = this.players[playerIndex].color;
        this.draw(shape, position, color);
    },

    draw: function(shape, position, color) {
        var that = this;
        var shapes = {
            'cross': function (position, color) {
                var cellSize = that.cellSize;
                var ctx = that.ctx;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(position.x + cellSize / 10, position.y + cellSize / 10);
                ctx.lineTo(position.x + cellSize - cellSize / 10,
                        position.y + cellSize - cellSize / 10);
                ctx.moveTo(position.x + cellSize - cellSize / 10, position.y + cellSize / 10);
                ctx.lineTo(position.x + cellSize / 10, position.y + cellSize - cellSize / 10);
                ctx.stroke();
            },
            'circle': function (position, color) {
                var cellSize = that.cellSize;
                var ctx = that.ctx;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.arc(position.x + cellSize / 2,
                        position.y + cellSize / 2,
                        2 * cellSize / 5,
                    0,
                        Math.PI * 2);
                ctx.stroke();
            }
        };
        shapes[shape](position, color);
    },

    runAction: function(action, message) {
        var that = this;
        var actions = {
            connection: function (message) {
                that.playerIndex = message.index;
                that.players = message.players;
            },
            newplayer: function (message) {
                if (message.index == that.playerIndex) {
                    return;
                }
                that.players = message.players;
                $('#game-info').text('A new player just connected');
            },
            newgame: function (message) {
                that.drawGrid();
                $('#new-game').hide();
                var info = 'The game starts now<br/>';
                if (message.next == that.playerIndex) {
                    info += 'Your turn to play';
                } else {
                    info += 'Waiting for player ' + message.next;
                }
                $('#game-info').html(info);
            },
            move: function (message) {
                that.drawPiece(message.coords, message.index);

                var winner = message.win;
                var info = '';
                if (winner != -1) {
                    if (winner == that.playerIndex) {
                        info = 'You won !';
                    } else {
                        info = 'Player ' + winner + ' won !';
                    }
                    message.text = info;
                    actions.endgame(message);
                    return;
                } else {
                    if (message.next == that.playerIndex) {
                        info = 'Your turn to play';
                    } else {
                        info = 'Waiting for player ' + message.next;
                    }
                }
                $('#game-info').text(info);
            },
            message: function (message) {
                $('#game-info').text(message.text);
            },
            endgame: function(message) {
                $('#game-info').text(message.text);
                $('#new-game').show();
            }
        };
        actions[action](message);
    }
};
window.Tictactoe = tictactoe;
})();


