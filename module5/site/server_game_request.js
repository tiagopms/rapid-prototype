var functions = require("./server_functions"),
	clone     = require("clone"),
	is_logged = functions.is_logged,
	in_room   = functions.in_room,
	xss       = functions.xss;

var game_request = function(socket, mysql, rooms) {
	socket.on("game_request", function( data ) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		in_room(socket.user.in_room, socket);
		if (!socket.user.in_room) {
			return;
		}
	
		var game_response = clone(rooms[socket.user.room.id]);
		var counter = 0;
		delete game_response.category;
		game_response.my_id = socket.user.user_id;

		var users_in_room = clone(game_response.users);
		delete game_response.users;
		game_response.users = {};
		for(var i in users_in_room) {
			game_response.users[i] = {name: users_in_room[i].username, points:  users_in_room[i].points, gravatar: users_in_room[i].gravatar, is_friend: false};
		}
		
		mysql.query(
			'SELECT accounts.id, is_friend FROM friends JOIN accounts ON (second_id=accounts.id) WHERE (accounts.username!=? and  (first_id=?))', 
			[xss(socket.user.username), xss(socket.user.user_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "12"});
					return;
				} 
				for(j in result) {
					var user = result[j];
					is_friend = (user.is_friend == "true");
					if (is_friend) {
						for(var i in users_in_room) {
							if(i == user.id) {
								game_response.users[i].is_friend = is_friend;
							}
						}
					}
				}
				socket.emit('game_response', game_response);
			}
		);
	});
};

module.exports.game_request = game_request;
