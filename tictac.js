var tictactoe = function() {

	var indexes = [0, 1];
	var colors = ['blue', 'red'];
	var shapes = ['cross', 'circle'];
	var players = [];
	var playersData = [];
	var grid = [];
	var nextTurn = -1;
	var gameRunning = false;


	this.initConnection = function(request){
		console.log('client connection');
		if (indexes.length == 0) return;
		var connection = request.accept(null, request.origin);
		var index = indexes.shift();
		players[index] = connection;
	
		playersData[index] = {'color':colors.shift(), 'shape':shapes.shift()};
	
		var initMessage = {'type':'connection','index':index, 'players':playersData};
		connection.sendUTF(JSON.stringify(initMessage));
		broadcast(JSON.stringify({'type':'newplayer', 'players':playersData}), index);
	
		if (indexes.length == 0) {
			newGame();
		} else {
			broadcast(JSON.stringify({'type':'message', 'text':'Waiting for another player...'}));
		}
	
		connection.on('message', function(message) {
			console.log(message);
			if (message.type == 'utf8') {
				var content = JSON.parse(message.utf8Data);
				switch (content.type) {
					case 'move':
						processMove(content.coords, index);
						break;
					default:
						break;
				}
			}
		});
	
	
		connection.on('close', function() {
			console.log('connection close');
			colors.push(playersData[index].color);
			shapes.push(playersData[index].shape);
			indexes.push(index);
			nextTurn = -1;
			gameRunning = false;
	
			players[index] = null;
			playersData[index] = null;
	
			console.log(playersData);
		});
	}

	function newGame()
	{
		gameRunning = true;
		nextTurn = 0;
		grid = [[-1, -1, -1], [-1, -1, -1], [-1, -1,-1]];
	
		var message = {'type':'newgame', 'next':nextTurn};
		message = JSON.stringify(message);
		broadcast(message);
	}
	
	function processMove(coords, playerIndex)
	{
		if (!gameRunning) {
			var message = {'type':'message','text':'The game did not begin yet.'};
			message = JSON.stringify(message);
			players[playerIndex].sendUTF(message);
			return;
		}
		if (nextTurn != playerIndex) {
			var message = {'type':'message','text':'Its not your turn to play.'};
			message = JSON.stringify(message);
			players[playerIndex].sendUTF(message);
			return;
		}
	
		if (grid[coords.x][coords.y] == -1) {
			grid[coords.x][coords.y] = playerIndex;
			nextTurn++;
			nextTurn %= 2;
	
			var win = checkWin();
			var message = {
				'type':'move',
				'coords':coords,
				'index':playerIndex,
				'next':nextTurn,
				'win':win};
			message = JSON.stringify(message);
			broadcast(message);
	
			if (win != -1) {
				gameRunning = false;
			}
	
		} else {
			var message = {'type':'message','text':'Move is not allowed'};
			message = JSON.stringify(message);
			players[playerIndex].sendUTF(message);
		}
	}

	function checkWin()
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

	function broadcast(message, exceptIndex)
	{
		for (var i = 0; i < players.length; i++) {
			if (i != exceptIndex && players[i] != null)
				players[i].sendUTF(message);
		}
	}
}

exports.tictactoe = tictactoe;
