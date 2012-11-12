var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var del_category = function(socket, mysql, check, sanitize, querystring) {
	socket.on("del_category", function( data ) {
		is_logged(socket.user.is_logged, socket);
		
console.log(data)
		if(socket.user.is_logged) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "25"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				try {
					check(data.category_id, "Invalid category").isNumeric();
				} catch (err) {
					var error = {"message": err.message, "code": "25"};
					socket.emit( 'error', error);
					validEntries = false;
				}
				if(validEntries) {
					mysql.query('SELECT COUNT(*) as found FROM accounts WHERE username=? and admin=\'true\'', [sanitize(socket.user.username).xss()],
						function(err, result, fields) {
							if (err) {
								var error = {"message": "Invalid sql query: " + err, "code": "25"};
								socket.emit( 'error', error);
							} else {
								var gadget = result[0];
								if (gadget.found != 1) {
									var error = {"message": "Invalid attempt, needs to be admin", "code": "25"};
									socket.emit( 'error', error);
								} else {
									mysql.query('SELECT COUNT(*) as found FROM categories WHERE id=?', [sanitize(data.category_id + "").xss()],
										function(err, result, fields) {
											if (err) {
												var error = {"message": "Invalid sql query 2: " + err, "code": "25"};
												socket.emit( 'error', error);
											} else {
												var gadget = result[0];
												if (gadget.found != 1) {
													var error = {"message": "Invalid attempt, category not found", "code": "25"};
													socket.emit( 'error', error);
												} else {
													mysql.query('DELETE FROM categories WHERE id=?', [sanitize(data.category_id + "").xss()],
														function(err, result, fields) {
															if (err) {
																var error = {"message": "Invalid sql query 3: "+ err, "code": "25"};
																socket.emit( 'error', error);
															} else {
																var success = {"message": "Category successfully deleted", "code": "25"};
																socket.emit('success', success);
															}
														} );
												}
											}
										} );
								}
							}
						});
				}
			}
		} 
	} );
};

module.exports.del_category = del_category;
