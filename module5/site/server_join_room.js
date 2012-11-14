var functions     = require("./server_functions"),
	check         = require("validator").check,
	crypto        = require('crypto'),
	is_logged     = functions.is_logged,
	outside_room  = functions.outside_room,
	xss           = functions.xss,
	valid_entries = functions.valid_entries;

var join_room = function(socket, mysql, rooms, room_id) {
	socket.on("join_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}

		outside_room(socket.user.in_room, socket);
		if (socket.user.in_room) {
			return;
		}


		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "19"});
			return;
		} 

		var validEntries = valid_entries(socket, "19", function() {
			check(data.room_id, "Invalid room id").isNumeric();
		});
		if (!validEntries) {
			return;
		}
		
		if(rooms[data.room_id] == undefined) {
			socket.emit('error', {"message": "Invalid room selected", "code": "19"});
			return;
		} 
		var is_friend = false,
			is_baned = false;
		mysql.query(
			'SELECT COUNT(*) as found, is_friend FROM friends WHERE (first_id=? and  second_id=?)', 
			[xss(rooms[data.room_id].host), xss(socket.user.user_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "19"});
					return;
				} 
				var gadget = result[0];
				if (gadget.found == 1) {
					is_friend = true;
					is_baned = (gadget.is_friend == "false");
				}
				if(is_baned || !(!rooms[data.room_id].private || is_friend)) {
					socket.emit('error', {"message": "Invalid room chosen", "code": "19"});
					return;
				} 
				rooms[data.room_id].users[socket.user.user_id] = {"username": socket.user.username, "points": 0, "gravatar": crypto.createHash('md5').update(socket.user.email).digest("hex")};
				rooms[data.room_id].next_drawers[rooms[data.room_id].next_drawers.length] = socket.user.user_id;
				socket.user.in_room = true;
				socket.leave('out');
				socket.join('room' + data.room_id);
				socket.broadcast.to("room" + data.room_id).emit('update');
				socket.user.room = {"id": data.room_id, "name": rooms[data.room_id].name, "category": rooms[data.room_id].category};
				
				socket.emit('success', {"message": "Joined room successfully", "code": "19"});
			}
		);
	});
};

module.exports.join_room = join_room;
