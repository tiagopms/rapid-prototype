var crypto = require('crypto');

var status_request = function(socket, mysql) {
	socket.on( 'status_request', function(data) {
		var status_response = {};
		
		if(!socket.user.is_logged) {
			status_response.stat = 0;
		} else {
			status_response.user = {
				"username": socket.user.username, 
				"gravatar": crypto.createHash('md5').update(socket.user.email).digest("hex"), 
				"admin": socket.user.admin, 
				"token": socket.user.token 
			};
			if (!socket.user.in_room) {
				status_response.stat = 1;
			} else {
				status_response.stat = 2;
				status_response.room = socket.user.room_name;
			}
		}
		
		socket.emit( 'status_response', status_response );
	} );
}

module.exports.status_request = status_request;
