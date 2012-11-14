var functions           = require("./server_functions"),
	is_logged           = functions.is_logged,
	in_room             = functions.in_room,
	clone               = require("clone"),
	get_word            = require("./server_get_word").get_word;

var disconnect = function(socket, mysql, rooms, users) {
	socket.on("disconnect", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		in_room(socket.user.in_room, socket);
		if (!socket.user.in_room) {
			return;
		}
		if(socket.user.room == undefined || rooms[socket.user.room.id] == undefined) {
			return;
		}

		
		if(rooms[socket.user.room.id].host == socket.user.user_id) { //host
			delete rooms[socket.user.room.id];
			socket.broadcast.to('room' + socket.user.room.id).emit('room_closed');
			var error = {"message": "Room closed. Host was disconnected", "code": "13"};
			socket.broadcast.to('room' + socket.user.room.id).emit( 'error', error);
			socket.leave('room' + socket.user.room.id);
			delete socket.user.room;
			socket.user.in_room = false;
			socket.join('out');
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
			delete socket.user.room;
			socket.user.in_room = false;
		}
	});
};

module.exports.disconnect = disconnect;
