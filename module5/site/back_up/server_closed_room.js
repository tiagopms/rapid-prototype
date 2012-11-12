var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var in_room = require("./server_functions").in_room;
var outside_room = require("./server_functions").outside_room;

var closed_room = function(socket, mysql, check, sanitize, querystring, rooms) {
	socket.on("closed_room", function( data ) {
		is_logged(socket.user.is_logged, socket);
		in_room(socket.user.in_room, socket);
		
		if(socket.user.is_logged && socket.user.in_room) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "13"};
				socket.emit( 'error', error);
			} else {
					socket.user.in_room = false;
					socket.leave('room' + socket.user.room.id);
					delete socket.user.room;
					
					var success = {"message": "Successfully left room", "code": "13"};
					socket.emit( 'success', success);
			}
		}
	} );
};

module.exports.closed_room = closed_room;
