var functions     = require("./server_functions"),
	is_logged     = functions.is_logged,
	outside_room  = functions.outside_room,
	xss           = functions.xss,
	valid_entries = functions.valid_entries,
	validator     = require("validator"),
	sanitize      = validator.sanitize,
	check         = validator.check,
	querystring   = require("querystring");

var create_room = function(socket, mysql, rooms, room_id) {
	socket.on("create_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		outside_room(socket.user.in_room, socket);
		if (socket.user.in_room) {
			return;
		}
		
		data = querystring.parse(data);
	
	
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "11"});
			return;	
		} 
		var validEntries = true;
		var is_private = sanitize(data.is_private).toBoolean();
		var category_id = data.category_id;
		
		var validEntries = valid_entries(socket, "11", function() {
			check(data.name, "Invalid name").isAlphanumeric().len(3,20);
			check(category_id, "Invalid category").isNumeric();
			check(data.drawing_time, "Invalid drawing time").isNumeric();
		}); 
		if (!validEntries) {
			return;
		}

		mysql.query(
			'SELECT COUNT(*) as found, name FROM categories WHERE id=?', 
			[xss(category_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "11"});
					return;
				} 
				var category = result[0];
				if ((result.length < 1) && (category_id != -1)) {
					socket.emit('error', {"message": "Invalid category chosen", "code": "11"});
					return;
				} 
				var category_name = (category.found == 1) ? category.name : "All categories";
				rooms[room_id] = {
					name: data.name, 
					private: is_private, 
					category: category_id, 
					category_name: category_name, 
					host: socket.user.user_id, 
					host_name: socket.user.username, 
					drawing_time: data.drawing_time,
					users: {}
				};
				rooms[room_id].users[socket.user.user_id] = socket.user.username;
				socket.user.in_room = true;
				socket.join('room' + room_id);
				socket.user.room = {
					id: room_id, 
					name: data.name, 
					category: category_id
				};
				room_id++;	
				socket.emit('success', {"message": "Room successfully created", "code": "11"});
			}
		);
		
	});
};

module.exports.create_room = create_room;
