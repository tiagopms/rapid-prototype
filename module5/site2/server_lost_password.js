var server_functions = require("./server_functions");
var is_logged = server_functions.is_logged,
    isnt_logged = server_functions.isnt_logged,
    random_token = server_functions.random_token;

var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP", {
	service: "Gmail",
	auth: {
		user: "imagesandaction@gmail.com",
		pass: "joaoetiago"
	}
});

var PasswordHash = require('phpass').PasswordHash;
var passwordHash = new PasswordHash();

var lost_password = function(socket, mysql, check, sanitize, querystring) {
	socket.on("lost_password", function( data ) {
		isnt_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(!socket.user.is_logged) {
			var validEntries = true;
			try {
				check(data.username, "Invalid username").isAlphanumeric().len(6,20);
				check(data.email, "Invalid email").isEmail().len(6,50);
			} catch (err) {
				var error = {"message": err.message, "code": "15"};
				socket.emit( 'error', error);
				validEntries = false;
			}
			if(validEntries) {
				mysql.query(
					'SELECT COUNT(*) as is_used FROM accounts WHERE username=? and email_address',
					[sanitize(data.username).xss(), sanitize(data.email).xss()],
					function(err, result, fields) {
						if (err) {
							var error = {"message": "Invalid sql query: "+ err, "code": "15"};
							socket.emit( 'error', error);
						} else {
							var gadget = result[0];
							if (gadget.is_used == 1) {
								var error = {"message": "Username and email doesn't match", "code": "15"};
								socket.emit( 'error', error);
							} else {
								var new_pass = random_token().substr(0, 10);
								var crypt_new_pass = passwordHash.hashPassword(sanitize(new_pass).xss());
								
								mysql.query(
									'UPDATE accounts SET crypt_pass=? WHERE username=? and email_address=?', 
									[crypt_new_pass, sanitize(data.username).xss(), sanitize(data.email).xss()],
									function(err, result, fields) {
										if (err) {
											var error = {"message": "Invalid sql query 2: "+ err, "code": "15"};
											socket.emit( 'error', error);
										} else {
											var mailOptions = {
												from: "Images and Action <imagesandaction@gmail.com>",
												to: sanitize(data.email).xss(),
  												subject: "New Password from ImagesAndAction",
												text: "Hi, \n\nYour new password is: " + sanitize(new_pass).xss() + "\n\nHave a nice day!\n"
											}	
											smtpTransport.sendMail(mailOptions, function(error, response) {
												if (error) {
													var error = {"message": "Message sent failed", "code": "15"};
													socket.emit('error', error);
												} else {
													var success = {"message": "A new password was sent to your email", "code": "15"};
													socket.emit('success', success);
												}
											});
		
										}
									} );
							}
						}
					});
			}
		} 
	} );
};

module.exports.lost_password = lost_password;
