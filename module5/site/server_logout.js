var get_word = require("./server_get_word").get_word,
	clone    = require("clone");

var logout = function(socket, mysql, sessions, sessionID, rooms, users) {
	socket.on("logout", function() {
		if(socket.user.user_id != undefined) {
			delete users[socket.user.user_id];
			socket.leave("user" + socket.user.user_id);
			if(socket.user.in_room) {
				if(rooms[socket.user.room.id].host == socket.user.user_id) { //host
					delete rooms[socket.user.room.id];
					socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
					var error = {"message": "Room closed. Host was disconnected", "code": "13"};
					socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
					socket.leave('room' + socket.user.room.id);
					socket.broadcast.to("out").emit('update');
				} else {
					rooms[socket.user.room.id].next_drawers.splice(rooms[socket.user.room.id].next_drawers.indexOf(socket.user.user_id),1);
					
					if(rooms[socket.user.room.id].drawer == socket.user.user_id) { //drawer
						var d = new Date();
						var time = d.getHours() + ":" + d.getMinutes();
						chat_response = {"sender": "", "msg": "Drawer quit game, selecting new drawer", "time": time};
						socket.broadcast.to('room' + socket.user.room.id).emit( 'chat_response', chat_response);
						socket.emit( 'chat_response', chat_response);
						
						var users_room = clone(socket.user.room);
						users_room.user_id = socket.user.user_id;
						get_word (socket, mysql, rooms, users_room, 1);
					}
					
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
		socket.broadcast.to("out").emit("update_users");
		socket.emit('success', {"message": "Successfull logout", "code": "3"});
	} );
};

module.exports.logout = logout;
