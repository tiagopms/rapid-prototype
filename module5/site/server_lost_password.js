var functions     = require("./server_functions"),
	check         = require("validator").check,
	PasswordHash  = require("phpass").PasswordHash,
	nodemailer    = require("nodemailer"),
	querystring   = require("querystring"),
	passwordHash  = new PasswordHash();
	xss           = functions.xss,
	isnt_logged   = functions.isnt_logged,
    random_token  = functions.random_token,
	valid_entries = functions.valid_entries;

var smtpTransport = nodemailer.createTransport("SMTP", {
	service: "Gmail",
	auth: {
		user: "imagesandaction@gmail.com",
		pass: "joaoetiago"
	}
});

var lost_password = function(socket, mysql) {
	socket.on("lost_password", function( data ) {
		isnt_logged(socket.user.is_logged, socket);
		if (socket.user.is_logged) {
			return;
		}
		
		data = querystring.parse(data);
		
		var validEntries = valid_entries(socket, "15", function() {
			check(data.username, "Invalid username").isAlphanumeric().len(6,20);
			check(data.email, "Invalid email").isEmail().len(6,50);
		});
		if (!validEntries) {
			return;
		}

		mysql.query(
			'SELECT COUNT(*) as is_used FROM accounts WHERE username=? and email_address=?',
			[xss(data.username), xss(data.email)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "15"});
					return;
				} 

				var gadget = result[0];
				if (gadget.is_used == 0) {
					socket.emit('error', {"message": "Username and email doesn't match", "code": "15"});
					return;
				} 
				var new_pass = random_token().substr(0, 10);
				var crypt_new_pass = passwordHash.hashPassword(xss(new_pass));
				
				mysql.query(
					'UPDATE accounts SET crypt_pass=? WHERE username=? and email_address=?', 
					[crypt_new_pass, xss(data.username), xss(data.email)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {"message": "Invalid sql query 2: "+ err, "code": "15"});
							return;
						} 
						var mailOptions = {
							from: "Images and Action <imagesandaction@gmail.com>",
							to: xss(data.email),
							subject: "New Password from ImagesAndAction",
							text: "Hi, \n\nYour new password is: " + xss(new_pass) + "\n\nHave a nice day!\n"
						};	
						smtpTransport.sendMail(mailOptions, function(error, response) {
							if (error) {
								socket.emit('error', {"message": "Message sent failed", "code": "15"});
								return;
							} 
							socket.emit('success', {"message": "A new password was sent to your email", "code": "15"});
						});

					}
				);
			}
		);
	});
};

module.exports.lost_password = lost_password;
