var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var PasswordHash = require('phpass').PasswordHash;
var passwordHash = new PasswordHash();

var logout = function(socket, mysql, check, sanitize, querystring) {
	socket.on("logout", function() {
		socket.user = {"is_logged": false, "in_room": false};	
		
		var success = {"message": "Account successfully created", "code": "3"};
		socket.emit( 'success', success);
	} );
};

module.exports.logout = logout;
