var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var random_token = require("./server_functions").random_token;

var PasswordHash = require('phpass').PasswordHash;
var passwordHash = new PasswordHash();

var login = function(socket, mysql, check, sanitize, querystring) {
	socket.on("login", function( data ) {
		isnt_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(!socket.user.is_logged) {
			var validEntries = true;
			try {
				check(data.username, "Invalid username").isAlphanumeric().len(6,20);
				check(data.password, "Invalid password").isAlphanumeric().len(6,20);
			} catch (err) {
				var error = {"message": err.message, "code": "4"};
				socket.emit( 'error', error);
				validEntries = false;
			}
			if(validEntries) {
				mysql.query('SELECT COUNT(*) as is_used, crypt_pass FROM accounts WHERE username=?', [sanitize(data.username).xss()],
					function(err, result, fields) {
						if (err) {
							var error = {"message": "Invalid sql query: "+ err, "code": "4"};
							socket.emit( 'error', error);
						} else {
							var gadget = result[0];
							if (gadget.is_used == 0) {
								var error = {"message": "Username doesn't exists", "code": "4"};
								socket.emit( 'error', error);
							} else {
								var crypt_pass = gadget.crypt_pass;
								if (!passwordHash.checkPassword(sanitize(data.password).xss(), crypt_pass)) {
									var error = {"message": "Password and username don't match", "code": "4"};
									socket.emit( 'error', error);
								} else {
									mysql.query('SELECT id, email_address, admin FROM accounts WHERE username=?', [sanitize(data.username).xss()],
										function(err, result, fields) {
											if (err) {
												var error = {"message": "Invalid sql query 2: "+ err, "code": "4"};
												socket.emit( 'error', error);
											} else {
												var user = result[0];
												socket.user.username = data.username;
												socket.user.user_id = user.id;
												socket.user.is_logged = true;
												socket.user.email = user.email_address;
												socket.user.admin = sanitize(user.admin).toBoolean();
												socket.user.token = random_token();
												
												var success = {"message": "Successfully logged in", "code": "4"};
												socket.emit( 'success', success);
											}
										} );
								}
							}
						}
					});
			}
		} 
	} );
};

module.exports.login = login;
