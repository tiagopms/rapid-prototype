var functions     = require("./server_functions"),
	crypto        = require("crypto"),
	isnt_logged   = functions.isnt_logged,
	random_token  = functions.random_token,
	valid_entries = functions.valid_entries,
	xss           = functions.xss,
	validator     = require("validator"),
	check         = validator.check,
	sanitize      = validator.sanitize,
	querystring   = require("querystring"),
	PasswordHash  = require("phpass").PasswordHash;
	passwordHash  = new PasswordHash();


var login = function(socket, mysql, users) {
	socket.on("login", function(data) {
		isnt_logged(socket.user.is_logged, socket);
		if (socket.user.is_logged) {
			return;
		}
		
		data = querystring.parse(data);
		
		var validEntries = valid_entries(socket, "4", function() {
			check(data.username, "Invalid username").isAlphanumeric().len(6,20);
			check(data.password, "Invalid password").isAlphanumeric().len(6,20);
		});
		if (!validEntries) {
			return;
		}

		mysql.query(
			'SELECT COUNT(*) as is_used, crypt_pass, id, email_address, admin FROM accounts WHERE username=?',
			[xss(data.username)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "4"});
					return;
				} 
				var user = result[0];
				if (user.is_used == 0) {
					socket.emit('error', {"message": "Username doesn't exists", "code": "4"});
					return;
				} 
				console.log(users);
				console.log(user);
				console.log(Object.keys(users).indexOf(user.id))
				if (Object.keys(users).indexOf(user.id + "") != -1) {
					socket.emit('error', {"message": "User already signed up", "code": "4"});
					return;
				} 
				var crypt_pass = user.crypt_pass;
				if (!passwordHash.checkPassword(xss(data.password), crypt_pass)) {
					socket.emit('error', {"message": "Password and username don't match", "code": "4"});
					return;
				} 
				
				socket.user.username = data.username;
				socket.user.user_id = user.id;
				socket.user.is_logged = true;
				socket.user.email = user.email_address;
				socket.user.admin = sanitize(user.admin).toBoolean();
				socket.user.token = random_token();
				users[user.id] = {
					username: data.username,
					gravatar: crypto.createHash('md5').update(user.email_address).digest("hex")
				};

				socket.join("user" + user.id);
				socket.join("out");
				
				socket.emit('success', {"message": "Successfully logged in", "code": "4"});
				socket.broadcast.to("out").emit("update_users");
					
			}
		);
			
			
			
	});
};

module.exports.login = login;
