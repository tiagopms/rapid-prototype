var functions = require("./server_functions"),
	is_logged = functions.is_logged,
	in_room   = functions.in_room,
	xss       = functions.xss;

var get_word = function(socket, mysql, rooms, users_room, leaving) {
	console.log(leaving)
	if(leaving == undefined) {
		users_room = socket.user.room;
	}
	if(users_room == undefined) {
		return;
	}
	
	var users_in_room = rooms[users_room.id].users;
console.log("Getting word");
	rooms[users_room.id].next_drawers[rooms[users_room.id].next_drawers.length] = rooms[users_room.id].next_drawers[0];
	rooms[users_room.id].next_drawers.splice(0,1);
	var chosen_user_id = rooms[users_room.id].next_drawers[0]; 
	
	if (leaving != undefined && chosen_user_id==users_room.user_id) {
		rooms[users_room.id].next_drawers[rooms[users_room.id].next_drawers.length] = rooms[users_room.id].next_drawers[0];
		rooms[users_room.id].next_drawers.splice(0,1);
		var chosen_user_id = rooms[users_room.id].next_drawers[0]; 
	}
	if (leaving != undefined && chosen_user_id==users_room.user_id) {
		return;
	}
	
	var selected_user = {};
	selected_user.id = chosen_user_id;
	selected_user.name = users_in_room[chosen_user_id].username;
	
	var category = users_room.category;
	mysql.query(
		'SELECT id FROM categories',
		function(err, result, fields) {
			if (err) {
				socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': "50"});
				return;
			} 
			if(category == -1) {
				category = Math.floor(Math.random()*result.length);
				category = result[category].id;
			}
			
			mysql.query(
				'SELECT id, word FROM words WHERE category_id=?',
				[xss(category)],
				function(err, result, fields) {
					if (err) {
						socket.emit('error', {'message': 'Invalid SQL query 2: ' + err, 'code': "50"});
						return;
					} 
					var word_number = Math.floor(Math.random()*result.length);
					
					var word = result[word_number].word;
					socket.broadcast.to("room" + users_room.id).emit("new_round", selected_user.id);
					socket.emit("new_round", selected_user.id);
					if(socket.user.user_id == undefined || selected_user.id != socket.user.user_id) {
						socket.broadcast.to("user" + selected_user.id).emit("drawing_word", word);
					} else {
						socket.emit("drawing_word", word);
					}
					
					socket.broadcast.to("room" + users_room.id).emit("update");
					socket.emit("update");
					
					rooms[users_room.id].word = word;
					rooms[users_room.id].drawer = selected_user.id;
					rooms[users_room.id].timer = (new Date).getTime();
				}   
			);
		}
	);
};

module.exports.get_word = get_word;
