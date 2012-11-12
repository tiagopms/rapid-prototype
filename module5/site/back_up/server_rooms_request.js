var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var clone = require('clone');

var rooms_request = function(socket, mysql, check, sanitize, querystring, rooms) {
	socket.on("rooms_request", function( data ) {
		is_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(socket.user.is_logged) {
			var room_number = 0;
			var room_response = [];
			for(i in rooms) {
				var is_friend = false,
				    visible = true;
				mysql.query('SELECT COUNT(*) as found, is_friend FROM friends WHERE (first_id=? and  second_id=?) or (first_id=? and  second_id=?)', [sanitize(rooms[i].host + "").xss(), sanitize(socket.user.id + "").xss(), sanitize(socket.user.id + "").xss(), sanitize(rooms[i].host + "").xss()],
					function(err, result, fields) {
						if (err) {
							var error = {"message": "Invalid sql query: "+ err, "code": "12"};
							socket.emit( 'error', error);
						} else {
							var gadget = result[0];
							if (gadget.found == 1) {
								is_friend = true;
								visible = (gadget.is_friend == "true");
							}
						}
					});
				if(visible && (!rooms[i].private || is_friend)) {
					room_response[room_number] = clone(rooms[i]);
					delete room_response[room_number].users;
					delete room_response[room_number].host;
					room_response[room_number].is_friend = is_friend;
					room_response[room_number].id = i;
					
					room_number++;
				}
			}
			socket.emit('rooms_response', room_response);
		} 
	} );
};

module.exports.rooms_request = rooms_request;
