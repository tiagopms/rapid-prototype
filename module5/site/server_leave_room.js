var functions    = require("./server_functions"),
	is_logged    = functions.is_logged,
	in_room      = functions.in_room;

var leave_room = function(socket, mysql, rooms) {
	socket.on("leave_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}

		in_room(socket.user.in_room, socket);
		if (!socket.user.in_room) {
			return;
		}

		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "14"});
			return;
		} 
		
		if(rooms[socket.user.room.id] == undefined) {
			socket.emit('error', {"message": "A problem ocurred in your session", "code": "14"});
			return;
		}

		if(rooms[socket.user.room.id].host == socket.user.user_id) {
			delete rooms[socket.user.room.id];
			socket.user.in_room = false;
			socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
			var error = {"message": "Room closed. Host left the room", "code": "14"};
			socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
			socket.leave('room' + socket.user.room.id);
			delete socket.user.room;
			
			socket.emit('success', {"message": "Successfully and deleted left room", "code": "14"});
			socket.broadcast.to("out").emit('update');
		} else {
			delete rooms[socket.user.room.id].users[socket.user.user_id];
			socket.user.in_room = false;
			socket.leave('room' + socket.user.room.id);
			socket.broadcast.to("room" + socket.user.room.id).emit('update');
			delete socket.user.room;
			
			socket.emit('success', {"message": "Successfully left room", "code": "14"});
		}
		socket.join('out');
	});
};

module.exports.leave_room = leave_room;
