var functions     = require("./server_functions"),
	is_logged   = functions.is_logged,
	random_token  = functions.random_token,
	xss           = functions.xss,
	valid_entries = functions.valid_entries,
	validator     = require("validator"),
	check         = validator.check,
	querystring   = require("querystring"),
	PasswordHash  = require("phpass").PasswordHash,
	passwordHash  = new PasswordHash();


var add_admin = function(socket, mysql) {
	socket.on("add_admin", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		//data = querystring.parse(data);
		
		var validEntries = valid_entries(socket, "2", function() {
			check(data.new_admin_id, "Invalid user").isNumeric();
		});
		if (!validEntries) {
			socket.emit('error', {"message": "Invalid entries", "code": "52"});
			return; 
		}
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "52"});
			return;	
		} 
		mysql.query(
			'SELECT COUNT(*) as found FROM accounts WHERE id=? && admin=\"true\"', 
			[xss(socket.user.user_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "52"});
					return;
				} 
				var user = result[0];
				if (user.found != 1) {
					socket.emit('error', {"message": "Username invalid", "code": "52"});
					return;
				} 
				mysql.query(
					'UPDATE accounts SET admin=\"true\" WHERE id=?', 
					[xss(data.new_admin_id)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {"message": "Invalid sql query 2: "+ err, "code": "52"});
							return;
						} 
						socket.emit('success', {"message": "Account successfully changed to admin", "code": "52"});
					}
				);
			}
		);
		
	});
};

module.exports.add_admin = add_admin;
