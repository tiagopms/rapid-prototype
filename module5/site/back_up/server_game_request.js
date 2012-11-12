var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var in_room = require("./server_functions").in_room;
var outside_room = require("./server_functions").outside_room;
var clone = require('clone');

var game_request = function(socket, mysql, check, sanitize, querystring, rooms) {
	socket.on("game_request", function( data ) {
		is_logged(socket.user.is_logged, socket);
		in_room(socket.user.in_room, socket);
	console.log("game_request");
		
		if(socket.user.is_logged && socket.user.in_room) {
			var game_response = clone(rooms[socket.user.room.id]);
			delete game_response.category;

			var users_in_room = clone(game_response.users);
			delete game_response.users;
			game_response.users = {};
			for(i in users_in_room) {
				var is_friend = false;
				mysql.query('SELECT COUNT(*) as found, is_friend FROM friends JOIN accounts ON (first_id=accounts.id) or (second_id=accounts.id) WHERE (accounts.username=? and  (second_id=? or first_id=?))', [sanitize(users_in_room[i]).xss(), sanitize(socket.user.id + "").xss(), sanitize(socket.user.id + "").xss()],
					function(err, result, fields) {
						if (err) {
							var error = {"message": "Invalid sql query: "+ err, "code": "12"};
							socket.emit( 'error', error);
						} else {
							var gadget = result[0];
							if (gadget.found == 1) {
								is_friend = (gadget.is_friend == "true");
							}
						}
					});
				game_response.users[i] = {name: users_in_room[i], is_friend: is_friend};
			}
			socket.emit('game_response', game_response);
		} 
	} );
};

module.exports.game_request = game_request;
