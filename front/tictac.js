"use strict";

(function() {
var tictactoe = function() {

};
tictactoe.prototype = {
    ctx: null,
    cellSize: 50,
    playerColors: ['blue', 'red'],
    grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    players: [{shape:'cross', color:'blue'}, {shape:'circle', color:'red'}],

    init: function(canvas) {
        this.ctx = canvas.getContext('2d');
        canvas.width = this.cellSize * 3;
        canvas.height = this.cellSize * 3;

        this.drawGrid();
    },

    drawGrid: function() {
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
                playerIndex = message.index;
                that.players = message.players;
            },
            newplayer: function (message) {
                that.players = message.players;
                $('#game-info').text('A new player just connected');
            },
            newgame: function (message) {
                var info = 'The game starts now<br/>';
                if (message.next == playerIndex) {
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
                    if (winner == playerIndex) {
                        info = 'You won !';
                    } else {
                        info = 'Player ' + winner + ' won !';
                    }
                } else {
                    if (message.next == playerIndex) {
                        info = 'Your turn to play';
                    } else {
                        info = 'Waiting for player ' + message.next;
                    }
                }
                $('#game-info').text(info);
            },
            message: function (message) {
                $('#game-info').text(message.text);
            }
        };
        actions[action](message);
    }
};
window.Tictactoe = tictactoe;
})();


