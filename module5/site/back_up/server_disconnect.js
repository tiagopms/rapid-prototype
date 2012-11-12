var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var in_room = require("./server_functions").in_room;
var outside_room = require("./server_functions").outside_room;

var disconnect = function(socket, mysql, check, sanitize, querystring, rooms) {
	socket.on("disconnect", function( data ) {
		is_logged(socket.user.is_logged, socket);
		in_room(socket.user.in_room, socket);
		
		if(socket.user.is_logged && socket.user.in_room) {
				if(rooms[socket.user.room.id].host == socket.user.user_id) {
					delete rooms[socket.user.room.id];
					socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
					var error = {"message": "Room closed. Host was disconnected", "code": "13"};
					socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
					socket.leave('room' + socket.user.room.id);
					delete socket.user.room;
					socket.user.in_room = false;
				} else {
					delete rooms[socket.user.room.id].users[socket.user.user_id];
					socket.leave('room' + socket.user.room.id);
					delete socket.user.room;
					socket.user.in_room = false;
				}
		}
	} );
};

module.exports.disconnect = disconnect;
