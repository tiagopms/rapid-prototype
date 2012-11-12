var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var edit_category = function(socket, mysql, check, sanitize, querystring) {
	socket.on("edit_category", function( data ) {
		is_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
		if(socket.user.is_logged) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "20"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				try {
					check(data.name, "Invalid name").isAlphanumeric().len(3,20);
					check(data.id, "Invalid category").isNumeric();
				} catch (err) {
					var error = {"message": err.message, "code": "21"};
					socket.emit( 'error', error);
					validEntries = false;
				}
				if(validEntries) {
					mysql.query('SELECT COUNT(*) as found FROM accounts WHERE username=? and admin=\'true\'', [sanitize(socket.user.username).xss()],
						function(err, result, fields) {
							if (err) {
								var error = {"message": "Invalid sql query: " + err, "code": "21"};
								socket.emit( 'error', error);
							} else {
								var gadget = result[0];
								if (gadget.found != 1) {
									var error = {"message": "Invalid attempt, needs to be admin", "code": "21"};
									socket.emit( 'error', error);
								} else {
									mysql.query('SELECT COUNT(*) as found FROM categories WHERE name=?', [sanitize(data.name).xss()],
										function(err, result, fields) {
											if (err) {
												var error = {"message": "Invalid sql query 2: " + err, "code": "21"};
												socket.emit( 'error', error);
											} else {
												var gadget = result[0];
												if (gadget.found != 1) {
													var error = {"message": "Invalid attempt, category not found", "code": "21"};
													socket.emit( 'error', error);
												} else {
													mysql.query('UPDATE categories SET name=? WHERE id=?', [sanitize(data.name).xss(), sanitize(data.id).xss()],
														function(err, result, fields) {
															if (err) {
																var error = {"message": "Invalid sql query 3: "+ err, "code": "21"};
																socket.emit( 'error', error);
															} else {
																mysql.query('SELECT id FROM categories WHERE name=?', [sanitize(data.name).xss()],
																	function(err, result, fields) {
																		if (err) {
																			var error = {"message": "Invalid sql query 4: " + err, "code": "21"};
																			socket.emit( 'error', error);
																		} else {
																			var words = data.words.split('\n');
																			var category_id = result[0].id;
																			mysql.query('DELETE FROM words WHERE category_id=?', [category_id],
																				function(err, result, fields) {
																					if (err) {
																						var error = {"message": "Invalid sql query 5: " + err, "code": "21"};
																						socket.emit( 'error', error);
																					}
																				} );
																			
																			for (i in words) {
																				try {
																					check(words[i], "Invalid word " + words[i]).len(2,200);
																					mysql.query('INSERT INTO words (words, category_id) VALUES (?, ?)', [sanitize(words[i]).xss(), category_id],
																						function(err, result, fields) {
																							if (err) {
																								var error = {"message": "Invalid sql query 6: " + err, "code": "21"};
																								socket.emit( 'error', error);
																							}
																						} );
																				} catch (err) {
																					var error = {"message": err.message, "code": "21"};
																					socket.emit( 'error', error);
																					validEntries = false;
																				}
																			}
																			
																			var success = {"message": "Category successfully created", "code": "21"};
																			socket.emit('success', success);
																		}
																	} );
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

module.exports.edit_category = edit_category;
