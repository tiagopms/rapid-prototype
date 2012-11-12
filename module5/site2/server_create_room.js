var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var create_room = function(socket, mysql, check, sanitize, querystring, rooms, room_id) {
	socket.on("create_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(socket.user.is_logged) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "11"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				var is_private = sanitize(data.is_private).toBoolean();
				try {
					check(data.name, "Invalid name").isAlphanumeric().len(3,20);
					check(data.category_id, "Invalid category").isNumeric();
				} catch (err) {
					var error = {"message": err.message, "code": "11"};
					socket.emit( 'error', error);
					validEntries = false;
				}
				if(validEntries) {
					mysql.query('SELECT COUNT(*) as found FROM categories WHERE id=?', [sanitize(data.category_id).xss()],
						function(err, result, fields) {
							if (err) {
								var error = {"message": "Invalid sql query: "+ err, "code": "11"};
								socket.emit( 'error', error);
							} else {
								var gadget = result[0];
								if (gadget.found != 1) {
									var error = {"message": "Invalid category chosen", "code": "11"};
									socket.emit( 'error', error);
								} else {
									rooms[room_id++] = {"name": data.name, "private": is_private, "category": data.category_id, "host": socket.user.user_id};
									rooms[room_id].users = {};
									rooms[room_id].users[socket.user.user_id] = socket.user.username;
									socket.user.in_room = true;
									socket.join('room' + room_id);
									socket.user.room = {"id": room_id, "name": data.name, "category": data.category_id};
									
									var success = {"message": "Room successfully created", "code": "11"};
									socket.emit( 'success', success);
								}
							}
						});
				}
			}
		} 
	} );
};

module.exports.create_room = create_room;
