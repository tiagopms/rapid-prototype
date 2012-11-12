var logout = function(socket, sessions, sessionID, rooms) {
	socket.on("logout", function() {
		if(socket.user.user_id != undefined) {
			socket.leave("user" + socket.user.user_id);
			if(socket.user.in_room) {
				if(rooms[socket.user.room.id].host == socket.user.user_id) {
					delete rooms[socket.user.room.id];
					socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
					var error = {"message": "Room closed. Host was disconnected", "code": "13"};
					socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
					socket.leave('room' + socket.user.room.id);
					socket.broadcast.to("out").emit('update');
				} else {
					delete rooms[socket.user.room.id].users[socket.user.user_id];
					socket.leave('room' + socket.user.room.id);
					socket.broadcast.to("room" + socket.user.room.id).emit('update');
				}
			}
			delete socket.user;
		}
		socket.user = {"is_logged": false, "in_room": false};	
		if(sessions[sessionID] != undefined) {
			delete sessions[sessionID];
		}
		socket.emit('success', {"message": "Successfull logout", "code": "3"});
	} );
};

module.exports.logout = logout;
