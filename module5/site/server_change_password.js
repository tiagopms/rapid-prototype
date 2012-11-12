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


var change_password = function(socket, mysql) {
	socket.on("change_password", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		data = querystring.parse(data);
		
		var validEntries = valid_entries(socket, "2", function() {
			check(data.old_password, "Invalid old password").isAlphanumeric().len(6,20);
			check(data.new_password, "Invalid new password").isAlphanumeric().len(6,20);
			check(data.new_password, "Passwords don't match").equals(data.check_password);
		});
		if (!validEntries) {
			socket.emit('error', {"message": "Invalid entries", "code": "51"});
			return; 
		}
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "51"});
			return;	
		} 
		mysql.query(
			'SELECT COUNT(*) as is_used, crypt_pass FROM accounts WHERE username=?', 
			[xss(socket.user.username)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "51"});
					return;
				} 
				var user = result[0];
				if (user.is_used != 1) {
					socket.emit('error', {"message": "Username invalid", "code": "51"});
					return;
				} 
				var crypt_pass = user.crypt_pass;
				if (!passwordHash.checkPassword(xss(data.old_password), crypt_pass)) {
					socket.emit('error', {"message": "Wrong password", "code": "51"});
					return;
				}
				var crypt_pass = passwordHash.hashPassword(xss(data.new_password));
				mysql.query(
					'UPDATE accounts SET crypt_pass=? WHERE username=?', 
					[crypt_pass, xss(socket.user.username)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {"message": "Invalid sql query 2: "+ err, "code": "51"});
							return;
						} 
						socket.emit('success', {"message": "Password successfully changed", "code": "51"});
					}
				);
			}
		);
		
	});
};

module.exports.change_password = change_password;
