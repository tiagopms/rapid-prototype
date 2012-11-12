var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var in_room = require("./server_functions").in_room;
var outside_room = require("./server_functions").outside_room;

var join_room = function(socket, mysql, check, sanitize, querystring, rooms, room_id) {
	socket.on("join_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		outside_room(socket.user.in_room, socket);
		
		if(socket.user.is_logged && !socket.user.in_room) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "12"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				
				try {
					check(data.room_id, "Invalid room id").isNumeric();
				} catch (err) {
					var error = {"message": err.message, "code": "12"};
					socket.emit( 'error', error);
					validEntries = false;
				}
				if(validEntries) {
					if(rooms[data.room_id] == undefined) {
						var error = {"message": "Invalid room selected", "code": "12"};
						socket.emit( 'error', error);
					} else {
						var is_friend = false;
						    is_baned = false;
						mysql.query('SELECT COUNT(*) as found, is_friend FROM friends WHERE (first_id=? and  second_id=?) or (first_id=? and  second_id=?)', [sanitize(rooms[data.room_id].host + "").xss(), sanitize(socket.user.id + "").xss(), sanitize(socket.user.id + "").xss(), sanitize(rooms[data.room_id].host + "").xss()],
							function(err, result, fields) {
								if (err) {
									var error = {"message": "Invalid sql query: "+ err, "code": "12"};
									socket.emit( 'error', error);
								} else {
									var gadget = result[0];
									if (gadget.found == 1) {
										is_friend = true;
										is_baned = (gadget.is_friend == "false");
									}
								}
							});
						if(is_baned || !(!rooms[data.room_id].private || is_friend)) {
							var error = {"message": "Invalid room chosen", "code": "12"};
							socket.emit( 'error', error);
						} else {
							rooms[data.room_id].users[socket.user.user_id] = socket.user.username;
							socket.user.in_room = true;
							socket.join('room' + data.room_id);
							socket.user.room = {"id": data.room_id, "name": rooms[data.room_id].name, "category": rooms[room_id].category};
							
							var success = {"message": "Joined room successfully", "code": "12"};
							socket.emit( 'success', success);
						}
					}
				}
			}
		} 
	} );
};

module.exports.join_room = join_room;
