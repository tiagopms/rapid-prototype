var functions     = require("./server_functions"),
	get_word      = require("./server_get_word").get_word,
	check         = require("validator").check,
	is_logged     = functions.is_logged,
	in_room       = functions.in_room,
	valid_entries = functions.valid_entries;

var chat_msg = function(socket, mysql, rooms) {
	socket.on( 'chat_msg', function( data ) {
		is_logged(is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		in_room(socket.user.in_room, socket);
		if (!socket.user.in_room) {
			return;
		}

		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "37"});
			return;
		} 
		
		if (data.msg != "") {	
			var validEntries = valid_entries(socket, "37", function() {
				check(data.msg, "Message is to big").len(0, 600);
			});
			if (!validEntries) {
				return;
			}

			var d = new Date();
			var time = d.getHours() + ":" + d.getMinutes();
			chat_response = {"sender": socket.user.username, "msg": data.msg, "time": time};
			socket.broadcast.to('room' + socket.user.room.id).emit( 'chat_response', chat_response);
			socket.emit( 'chat_response', chat_response);

			if(data.msg == rooms[socket.user.room.id].word) {
				chat_response = {"sender": "", "msg": "User " + socket.user.username + " got the right answer!", "time": time};
				socket.broadcast.to('room' + socket.user.room.id).emit( 'chat_response', chat_response);
				socket.emit( 'chat_response', chat_response);
				
				get_word (socket, mysql, rooms);
			}
		}
	});
};

module.exports.chat_msg = chat_msg;
