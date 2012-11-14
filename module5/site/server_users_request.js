var functions = require("./server_functions"),
	clone     = require("clone"),
	is_logged = functions.is_logged,
	outside_room   = functions.outside_room,
	xss       = functions.xss;



var send_users_response = function(socket, mysql, users) {	
	is_logged(socket.user.is_logged, socket);
	if (!socket.user.is_logged) {
		return;
	}
	outside_room(socket.user.in_room, socket);
	if (socket.user.in_room) {
		return;
	}

	var users_response = {};
	for(var i in users) {
		users_response[i] = {name: users[i].username, gravatar: users[i].gravatar, is_friend: false, my_id: false};
	}
	users_response[socket.user.user_id].my_id = true;

	mysql.query(
		'SELECT accounts.id, is_friend FROM friends JOIN accounts ON (second_id=accounts.id) WHERE (accounts.username!=? and  (first_id=?))', 
		[xss(socket.user.username), xss(socket.user.user_id)],
		function(err, result, fields) {
			if (err) {
				socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "12"});
				return;
			} 
			for(var j in result) {
				var user = result[j];
				is_friend = (user.is_friend == "true");
				if (is_friend) {
					for(var i in users_response) {
						if(i == user.id) {
							users_response[i].is_friend = is_friend;
						}
					}
				}
			}
			socket.emit('users_response', users_response);
		}
	);
};


var users_request = function(socket, mysql, users) {
	socket.on("users_request", function() {
		send_users_response(socket, mysql, users);
	});
};


module.exports.users_request = users_request;
module.exports.send_users_response = send_users_response;
