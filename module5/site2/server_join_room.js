var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var join_room = function(socket, mysql, check, sanitize, querystring, rooms, room_id) {
	socket.on("join_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(socket.user.is_logged) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "12"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				
				try {
					check(data.room_id, "Invalid category").isNumeric();
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
						var joining_allowed = true;
						if(rooms[data.room_id].private) {
							mysql.query('SELECT COUNT(*) as found FROM friends WHERE (first_id=? and  second_id=?) or (first_id=? and  second_id=?)', [sanitize(rooms[data.room_id].host).xss(), sanitize(socket.user.id).xss(), sanitize(socket.user.id).xss(), sanitize(rooms[data.room_id].host).xss()],
								function(err, result, fields) {
									if (err) {
										var error = {"message": "Invalid sql query: "+ err, "code": "12"};
										socket.emit( 'error', error);
									} else {
										var gadget = result[0];
										if (gadget.found != 1) {
											var error = {"message": "Invalid room chosen", "code": "12"};
											socket.emit( 'error', error);
											joining_allowed = false;
										} else {
											joining_allowed = true;
										}
									}
								});
						}
						if(joining_allowed) {
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
