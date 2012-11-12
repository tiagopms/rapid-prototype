var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var in_room = require("./server_functions").in_room;
var outside_room = require("./server_functions").outside_room;

var leave_room = function(socket, mysql, check, sanitize, querystring, rooms) {
	socket.on("leave_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		in_room(socket.user.in_room, socket);
		
		if(socket.user.is_logged && socket.user.in_room) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "13"};
				socket.emit( 'error', error);
			} else {
				if(rooms[socket.user.room.id] == undefined) {
					var error = {"message": "A problemocurred in your session", "code": "13"};
					socket.emit( 'error', error);
				}
				if(rooms[socket.user.room.id].host == socket.user.user_id) {
					delete rooms[socket.user.room.id];
					socket.user.in_room = false;
					socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
					var error = {"message": "Room closed. Host left the room", "code": "13"};
					socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
					socket.leave('room' + socket.user.room.id);
					delete socket.user.room;
					
					var success = {"message": "Successfully and deleted left room", "code": "13"};
					socket.emit('success', success);
				} else {
					delete rooms[socket.user.room.id].users[socket.user.user_id];
					socket.user.in_room = false;
					socket.leave('room' + socket.user.room.id);
					delete socket.user.room;
					
					var success = {"message": "Successfully left room", "code": "13"};
					socket.emit( 'success', success);
				}
			}
		}
	} );
};

module.exports.leave_room = leave_room;
