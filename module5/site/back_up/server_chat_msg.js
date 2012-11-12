var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var in_room = require("./server_functions").in_room;
var outside_room = require("./server_functions").outside_room;

var chat_msg = function(socket, mysql, check, sanitize, querystring, rooms, room_id) {
	socket.on( 'chat_msg', function( data ) {
		is_logged(is_logged, socket);
		in_room(socket.user.in_room, socket);
		
		if(socket.user.is_logged && socket.user.in_room) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "37"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				
				if (data.msg != "") {
					try {
						check(data.msg, "Message is to big").len(0, 600);
					} catch (err) {
						var error = {"message": err.message, "code": "12"};
						socket.emit( 'error', error);
						//socket.emit( 'chat_incMsg', data );
						validEntries = false;
					}
					if(validEntries) {
						var d = new Date();
						var time = d.getHours() + ":" + d.getMinutes();
						console.log(data);
						chat_response = {"sender": socket.user.username, "msg": data.msg, "time": time};
						socket.broadcast.to('room' + socket.user.room.id).emit( 'chat_response', chat_response);
						socket.emit( 'chat_response', chat_response);
						console.log("Received chat message");
					}
				}
			}
		}
	});
};

module.exports.chat_msg = chat_msg;
