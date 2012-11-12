function is_logged (is_logged, socket) {
	if(!is_logged) {
		var data = {"message": "Invalid request, user isnt logged", "code": "0"};
		socket.emit( 'error', data );
	}
}
function isnt_logged (is_logged, socket) {
	if(is_logged) {
		var data = {"message": "Invalid request, user is already logged", "code": "0"};
		socket.emit( 'error', data );
	}
}

function random_token() {
	var chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
	var rand = function() {
		return Math.floor(Math.random()*chars.length);
	}
	var token = "";
	for (var counter = 0; counter <= 35; counter++) {
		token += chars[rand()];
	}
	return token;
}

module.exports.is_logged = is_logged;
module.exports.isnt_logged = isnt_logged;
module.exports.random_token = random_token;
