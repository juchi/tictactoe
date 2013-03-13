var tictactoe = function() {
	
	var games = [];
	
	var Player = function(socket) {
		var connection = socket;
		connection.player = this;
		
		this.index = 0;
		this.game = null;
		
		this.sendMessage = function(message) {
			connection.sendUTF(message);
		};
	};
	
	var Game = function() {
		var indexes = [0, 1];
		var colors = ['blue', 'red'];
		var shapes = ['cross', 'circle'];
		var grid = [];
		var nextTurn = -1;
		var running = false;
		
		var players = [];
		var playersData = [];
		
		this.newPlayer = function() {
			if (indexes.length == 0) return;
			var index = indexes.shift();
			
			player.index = index;
			player.game = this;
			players[index] = player;
			playersData[index] = {'color':colors.shift(), 'shape':shapes.shift()};
			
			var initMessage = {'type':'connection','index':index, 'players':playersData};
			player.sendMessage(JSON.stringify(initMessage));
			broadcast(players, JSON.stringify({'type':'newplayer', 'players':playersData}), index);
			
			if (indexes.length == 0) {
				this.start();
			} else {
				broadcast(players, JSON.stringify({'type':'message', 'text':'Waiting for another player...'}));
			}
		};
		
		this.start = function() {
			running = true;
			nextTurn = 0;
			grid = [[-1, -1, -1], [-1, -1, -1], [-1, -1,-1]];
		
			var message = {'type':'newgame', 'next':nextTurn};
			message = JSON.stringify(message);
			broadcast(players, message);
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
			index = player.index;
			player.game = null;
			
			colors.push(playersData[index].color);
			shapes.push(playersData[index].shape);
			
			players[index] = null;
			playersData[index] = null;
			
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
	
	this.initConnection = function(request) {
		console.log('client connection');
		
		var connection = request.accept(null, request.origin);
		player = new Player(connection);
		
		var game = getGameInstance();
		game.newPlayer(player);
		
		connection.on('message', manageMessage);
		connection.on('close', manageClose);
	};
	
	function manageMessage(message) {
		console.log(message);
		if (message.type == 'utf8') {
			var content = JSON.parse(message.utf8Data);
			switch (content.type) {
				case 'move':
					var game = this.player.game;
					game.processMove(content.coords, this.player);
					break;
				default:
					break;
			}
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

	function broadcast(players, message, exceptIndex)
	{
		for (var i = 0; i < players.length; i++) {
			if (i != exceptIndex && players[i] != null)
				players[i].sendMessage(message);
		}
	}
}

exports.tictactoe = tictactoe;
