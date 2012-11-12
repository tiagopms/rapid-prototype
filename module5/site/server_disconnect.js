var functions    = require("./server_functions"),
	is_logged    = functions.is_logged,
	in_room      = functions.in_room;

var disconnect = function(socket, mysql, rooms) {
	socket.on("disconnect", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		in_room(socket.user.in_room, socket);
		if (!socket.user.in_room) {
			return;
		}

		if(rooms[socket.user.room.id].host == socket.user.user_id) {
			delete rooms[socket.user.room.id];
			socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
			var error = {"message": "Room closed. Host was disconnected", "code": "13"};
			socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
			socket.leave('room' + socket.user.room.id);
			delete socket.user.room;
			socket.user.in_room = false;
			socket.join('out');
			socket.broadcast.to("out").emit('update');
		} else {
			delete rooms[socket.user.room.id].users[socket.user.user_id];
			socket.leave('room' + socket.user.room.id);
			socket.broadcast.to("room" + socket.user.room.id).emit('update');
			delete socket.user.room;
			socket.user.in_room = false;
		}
	});
};

module.exports.disconnect = disconnect;
