var tictactoe = {
    ctx: null,
    cellSize: 50,
    playerColors: ['blue', 'red'],
    grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    players: [{shape:'cross', color:'blue'}, {shape:'circle', color:'red'}],


    init: function(canvas)
    {
        this.ctx = canvas.getContext('2d');
        canvas.width = this.cellSize * 3;
        canvas.height = this.cellSize * 3;

        this.drawGrid();
    },

    drawGrid: function()
    {
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
        drawFunction = this.drawFunctions[players[playerIndex].shape];
        drawFunction(this.getTopLeftPosition(coords), players[playerIndex].color);
    },


    drawFunctions: {
        'cross': function(position, color) {
            var cellSize = tictactoe.cellSize;
            var ctx = tictactoe.ctx;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(position.x + cellSize / 10, position.y + cellSize / 10);
            ctx.lineTo(position.x + cellSize - cellSize / 10,
                    position.y + cellSize - cellSize / 10);
            ctx.moveTo(position.x + cellSize - cellSize / 10, position.y + cellSize / 10);
            ctx.lineTo(position.x + cellSize / 10, position.y + cellSize - cellSize / 10);
            ctx.stroke();
        },
        'circle': function(position, color) {
            var cellSize = tictactoe.cellSize;
            var ctx = tictactoe.ctx;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(position.x + cellSize / 2,
                    position.y + cellSize / 2,
                    2 * cellSize / 5,
                    0,
                    Math.PI * 2);
            ctx.stroke();
        }
    },

    actions: {
        connection: function(message) {
            playerIndex = message.index;
            players = message.players;
        },
        newplayer: function(message) {
            players = message.players;
            $('#game-info').text('A new player just connected');
        },
        newgame: function(message) {
            var info = 'The game starts now<br/>';
            if (message.next == playerIndex) {
                info += 'Your turn to play';
            } else {
                info += 'Waiting for player ' + message.next;
            }
            $('#game-info').html(info);
        },
        move: function(message) {
            tictactoe.drawPiece(message.coords, message.index);

            var winner = message.win;
            var info = '';
            if (winner != -1) {
                if (winner == playerIndex) {
                    info = 'You won !';
                } else {
                    info = 'Player '+winner+' won !';
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
        message: function(message) {
            $('#game-info').text(message.text);
        }
    }
};

