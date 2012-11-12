var functions = require("./server_functions"),
	is_logged = functions.is_logged,
	in_room   = functions.in_room,
	xss       = functions.xss;

var get_word = function(socket, mysql, rooms) {
	var users_in_room = rooms[socket.user.room.id].users;
	var chosen_user = Math.floor(Math.random()*Object.keys(users_in_room).length);
console.log(Object.keys(users_in_room));
	var chosen_user_id = Object.keys(users_in_room)[chosen_user];

	var selected_user = {};
	selected_user.id = chosen_user_id;
	selected_user.name = users_in_room[chosen_user_id];
console.log(selected_user)

	
	var category = socket.user.room.category;
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
		console.log("word is :")
		console.log(word)
					socket.broadcast.to("room" + socket.user.room.id).emit("new_round", selected_user.username);
					socket.emit("new_round", selected_user.username);
					if(selected_user.id != socket.user.user_id) {
						socket.broadcast.to("user" + selected_user.id).emit("drawing_word", word);
					} else {
						socket.emit("drawing_word", word);
					}
console.log(selected_user)
					rooms[socket.user.room.id].word = word;
					rooms[socket.user.room.id].timer = (new Date).getTime();
				}   
			);
		}
	);
};

module.exports.get_word = get_word;
