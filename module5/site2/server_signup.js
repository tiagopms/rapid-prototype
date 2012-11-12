var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;
var random_token = require("./server_functions").random_token;

var PasswordHash = require('phpass').PasswordHash;
var passwordHash = new PasswordHash();

var signup = function(socket, mysql, check, sanitize, querystring) {
	socket.on("signup", function( data ) {
		isnt_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(!socket.user.is_logged) {
			var validEntries = true;
			try {
				check(data.username, "Invalid username").isAlphanumeric().len(6,20);
				check(data.email, "Invalid email").isEmail().len(6,50);
				check(data.password, "Invalid password").isAlphanumeric().len(6,20);
				check(data.password, "Passwords don't match").equals(data.check_password);
			} catch (err) {
				var error = {"message": err.message, "code": "2"};
				socket.emit( 'error', error);
				validEntries = false;
			}
			if(validEntries) {
				mysql.query('SELECT COUNT(*) as is_used FROM accounts WHERE username=?', [sanitize(data.username).xss()],
					function(err, result, fields) {
						if (err) {
							var error = {"message": "Invalid sql query: "+ err, "code": "2"};
							socket.emit( 'error', error);
						} else {
							var gadget = result[0];
							if (gadget.is_used == 1) {
								var error = {"message": "Username already in use", "code": "2"};
								socket.emit( 'error', error);
							} else {
								var crypt_pass = passwordHash.hashPassword(sanitize(data.password).xss());
								
								mysql.query('INSERT INTO accounts (username, crypt_pass, email_address) VALUES (?, ?, ?)', [sanitize(data.username).xss(), crypt_pass, sanitize(data.email).xss()],
									function(err, result, fields) {
										if (err) {
											var error = {"message": "Invalid sql query 2: "+ err, "code": "2"};
											socket.emit( 'error', error);
										} else {
											mysql.query('SELECT id FROM accounts WHERE username=?', [sanitize(data.username).xss()],
												function(err, result, fields) {
													if (err) {
														var error = {"message": "Invalid sql query 3: "+ err, "code": "2"};
														socket.emit( 'error', error);
													} else {
														var user = result[0];
														socket.user.username = data.username;
														socket.user.user_id = user.id;
														socket.user.is_logged = true;
														socket.user.email = data.email;
														socket.user.admin = false;
														socket.user.token = random_token();
														
														var success = {"message": "Account successfully created", "code": "2"};
														socket.emit( 'success', success);
													}
												} );
										}
									} );
							}
						}
					});
			}
		} 
	} );
};

module.exports.signup = signup;
