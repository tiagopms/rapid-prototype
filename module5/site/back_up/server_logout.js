var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var PasswordHash = require('phpass').PasswordHash;
var passwordHash = new PasswordHash();

var logout = function(socket, mysql, querystring, sessions, sessionID) {
	socket.on("logout", function() {
		socket.user = {"is_logged": false, "in_room": false};	
		delete sessions[sessionID];
		socket.emit('success', {"message": "Successfull logout", "code": "3"});
	} );
};

module.exports.logout = logout;
