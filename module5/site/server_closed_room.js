var functions = require("./server_functions"),
	is_logged = functions.is_logged,
	in_room   = functions.in_room;

var closed_room = function(socket, mysql) {
	socket.on("closed_room", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}

		in_room(socket.user.in_room, socket);
		if (!socket.user.in_room) {
			return;
		}

		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "13"});
			return;
		} 
		if(socket.user.room == undefined) {
			socket.emit('error', {"message": "A problem ocurred in your session", "code": "14"});
			return;
		}
		
		socket.user.in_room = false;
		socket.leave('room' + socket.user.room.id);
		socket.join('out');
		delete socket.user.room;
		
		socket.emit('success', {"message": "Successfully left room", "code": "13"});
		socket.join('out');
	});
};

module.exports.closed_room = closed_room;
