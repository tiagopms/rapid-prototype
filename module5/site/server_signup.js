var functions     = require("./server_functions"),
	inst_logged   = functions.inst_logged,
	random_token  = functions.random_token,
	xss           = functions.xss,
	valid_entries = functions.valid_entries,
	validator     = require("validator"),
	check         = validator.check,
	querystring   = require("querystring"),
	PasswordHash  = require("phpass").PasswordHash,
	passwordHash  = new PasswordHash();


var signup = function(socket, mysql) {
	socket.on("signup", function(data) {
		isnt_logged(socket.user.is_logged, socket);
		if (socket.user.is_logged) {
			return;
		}
		
		data = querystring.parse(data);
		
		var validEntries = valid_entries(socket, "2", function() {
			check(data.username, "Invalid username").isAlphanumeric().len(6,20);
			check(data.email, "Invalid email").isEmail().len(6,50);
			check(data.password, "Invalid password").isAlphanumeric().len(6,20);
			check(data.password, "Passwords don't match").equals(data.check_password);
		});
		if (!validEntries) {
			return; 
		}
		mysql.query(
			'SELECT COUNT(*) as is_used FROM accounts WHERE username=?', 
			[xss(data.username)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "2"});
					return;
				} 
				var user = result[0];
				if (user.is_used == 1) {
					socket.emit('error', {"message": "Username already in use", "code": "2"});
					return;
				} 
				var crypt_pass = passwordHash.hashPassword(xss(data.password));
				mysql.query(
					'INSERT INTO accounts (username, crypt_pass, email_address) VALUES (?, ?, ?)', 
					[xss(data.username), crypt_pass, xss(data.email)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {"message": "Invalid sql query 2: "+ err, "code": "2"});
							return;
						} 
						mysql.query(
							'SELECT id FROM accounts WHERE username=?', 
							[xss(data.username)],
							function(err, result, fields) {
								if (err) {
									socket.emit('error', {"message": "Invalid sql query 3: "+ err, "code": "2"});
									return;
								} 
								var user = result[0];
								socket.user.username = data.username;
								socket.user.user_id = user.id;
								socket.user.is_logged = true;
								socket.user.email = data.email;
								socket.user.admin = false;
								socket.user.token = random_token();
								
								socket.join("user" + user.id);
								socket.join("out");
								
								socket.emit('success', {"message": "Account successfully created", "code": "2"});
							}
						);
					}
				);
			}
		);
		
	});
};

module.exports.signup = signup;
