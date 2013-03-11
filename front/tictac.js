var ctx;
var cellSize = 50;
var playerColors = ['blue', 'red'];
var grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
var players = [{shape:'cross', color:'blue'}, {shape:'circle', color:'red'}];
var drawFunctions = {'cross':drawCross, 'circle':drawCircle};

function init(canvas)
{
	ctx = canvas.getContext('2d');
	canvas.width = cellSize * 3;
	canvas.height = cellSize * 3;

	drawGrid();
}

function drawGrid()
{
	ctx.strokeStyle = 'black';
	ctx.beginPath();
	ctx.moveTo(cellSize, 0);
	ctx.lineTo(cellSize, cellSize * 3);
	ctx.stroke();
	ctx.moveTo(cellSize * 2, 0);
	ctx.lineTo(cellSize * 2, cellSize * 3);
	ctx.stroke();

	ctx.moveTo(0, cellSize);
	ctx.lineTo(cellSize * 3, cellSize);
	ctx.stroke();
	ctx.moveTo(0, cellSize * 2);
	ctx.lineTo(cellSize * 3, cellSize * 2);
	ctx.stroke();

}


function getCellFromPosition(pos)
{
	var coords = {};
	coords.x = Math.floor(pos.x / cellSize);
	coords.y = Math.floor(pos.y / cellSize);
	return coords;
}

function getTopLeftPosition(coords)
{
	var pos = {};
	pos.x = coords.x * cellSize;
	pos.y = coords.y * cellSize;
	return pos;
}

function drawPiece(coords, playerIndex)
{
	drawFunction = drawFunctions[players[playerIndex].shape];
	drawFunction(getTopLeftPosition(coords), players[playerIndex].color);
}

function drawCross(position, color)
{
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(position.x + cellSize / 10, position.y + cellSize / 10);
	ctx.lineTo(position.x + cellSize - cellSize / 10,
			position.y + cellSize - cellSize / 10);
	ctx.moveTo(position.x + cellSize - cellSize / 10, position.y + cellSize / 10);
	ctx.lineTo(position.x + cellSize / 10, position.y + cellSize - cellSize / 10);
	ctx.stroke();

}

function drawCircle(position, color)
{
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(position.x + cellSize / 2,
			position.y + cellSize / 2,
			2 * cellSize / 5,
			0,
			Math.PI * 2);
	ctx.stroke();
}

var actions = {};
actions.connection = function(message) {
	playerIndex = message.index;
	players = message.players;
};
actions.newplayer = function(message) {
	players = message.players;
	$('#game-info').text('A new player just connected');
};
actions.newgame = function(message) {
	var info = 'The game starts now<br/>';
	if (message.next == playerIndex) {
		info += 'Your turn to play';
	} else {
		info += 'Waiting for player ' + message.next;
	}
	$('#game-info').html(info);
};
actions.move = function(message) {
	drawPiece(message.coords, message.index);

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
};
actions.message = function(message) {
	$('#game-info').text(message.text);
};

