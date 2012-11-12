var sanitize = require("validator").sanitize;

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
function in_room (in_room, socket) {
	if(!in_room) {
		var data = {"message": "Invalid request, user isnt in a room", "code": "0"};
		socket.emit( 'error', data );
	}
}
function outside_room (in_room, socket) {
	if(in_room) {
		var data = {"message": "Invalid request, user is already in a room", "code": "0"};
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

function xss(text) {
	return sanitize(text+"").xss();
}

function valid_entries(socket, code, func) {
	try {
		func();
		return true;
	} catch (err) {
		socket.emit('error', {
			message: err.message,
			code: code,
		});
		return false;
	}
}

module.exports.is_logged = is_logged;
module.exports.isnt_logged = isnt_logged;
module.exports.in_room = in_room;
module.exports.outside_room = outside_room;
module.exports.random_token = random_token;
module.exports.xss = xss;
module.exports.valid_entries = valid_entries;
