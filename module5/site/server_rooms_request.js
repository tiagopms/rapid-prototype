var functions = require("./server_functions"),
	clone     = require("clone"),
	is_logged = functions.is_logged,
	xss       = functions.xss;

var rooms_request = function(socket, mysql, rooms) {
	socket.on("rooms_request", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}

		var room_number = 0,
			room_response = [];
		
		for(var i in rooms) {
			room_response[room_number] = clone(rooms[i]);

			delete room_response[room_number].users;
			room_response[room_number].is_friend = false;
			room_response[room_number].id = i;
			
			room_number++;
		}
		
		var is_friend = false;
			
		mysql.query(
			'SELECT first_id, is_friend FROM friends WHERE (second_id=?)', 
			[xss(socket.user.user_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "18"});
					return;
				} 
				
				for(var j in result) {
					var gadget = result[j];
					is_friend = (gadget.is_friend == "true");
					for(var i in room_response) {
						if(gadget.first_id == room_response[i].host) {
							if(is_friend) {
								room_response[i].is_friend = is_friend;
							} else {
								delete room_response[i];
							}
						}
					}
				}

				for(var i in room_response) {
					delete room_response[i].host;
					if(room_response[i].private && !room_response[i].is_friend) {
						delete room_response[i];
					}
				}
				socket.emit('rooms_response', room_response);
			}
		);
	}); 
};

module.exports.rooms_request = rooms_request;
