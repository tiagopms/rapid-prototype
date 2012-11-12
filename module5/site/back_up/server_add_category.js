var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var add_category = function(socket, mysql, check, sanitize, querystring) {
	socket.on("add_category", function( data ) {
		is_logged(socket.user.is_logged, socket);
		data = querystring.parse(data);
		
console.log("adding!");
		if(socket.user.is_logged) {
			if(data.token != socket.user.token) {
				var error = {"message": "Invalid request", "code": "20"};
				socket.emit( 'error', error);
			} else {
				var validEntries = true;
				try {
					check(data.name, "Invalid name").isAlphanumeric().len(3,20);
				} catch (err) {
					var error = {"message": err.message, "code": "20"};
					socket.emit( 'error', error);
					validEntries = false;
				}
				if(validEntries) {
					mysql.query('SELECT COUNT(*) as found FROM accounts WHERE username=? and admin=\'true\'', [sanitize(socket.user.username).xss()],
						function(err, result, fields) {
							if (err) {
								var error = {"message": "Invalid sql query: " + err, "code": "20"};
								socket.emit( 'error', error);
							} else {
								var gadget = result[0];
								if (gadget.found != 1) {
									var error = {"message": "Invalid attempt, needs to be user", "code": "20"};
									socket.emit( 'error', error);
								} else {
									mysql.query('SELECT COUNT(*) as found FROM categories WHERE name=?', [sanitize(data.name).xss()],
										function(err, result, fields) {
											if (err) {
												var error = {"message": "Invalid sql query 2: " + err, "code": "20"};
												socket.emit( 'error', error);
											} else {
												mysql.query('INSERT INTO categories (name) VALUES (?)', [sanitize(data.name).xss()],
													function(err, result, fields) {
														if (err) {
															var error = {"message": "Invalid sql query 3: "+ err, "code": "20"};
															socket.emit( 'error', error);
														} else {
															mysql.query('SELECT id FROM categories WHERE name=?', [sanitize(data.name).xss()],
																function(err, result, fields) {
																	if (err) {
																		var error = {"message": "Invalid sql query 4: " + err, "code": "20"};
																		socket.emit( 'error', error);
																	} else {
																		var words = data.words.split(/\r\n/);
																		var category_id = result[0].id;
																		var one_success = false;
																		
																		for (i in words) {
																			try {
																				check(words[i], "Invalid word " + words[i]).len(1,200).notEmpty();
																				mysql.query('INSERT INTO words (word, category_id) VALUES (?, ?)', [sanitize(words[i]).xss(), category_id],
																					function(err, result, fields) {
																						if (err) {
																							var error = {"message": "Invalid sql query 5: " + err, "code": "20"};
																							socket.emit( 'error', error);
																							mysql.query('DELETE FROM categories WHERE id=?', [category_id],
																								function(err, result, fields) {
																									if (err) {                                      
																										var error = {"message": "Invalid sql query 5: "+ err, "code": "20"};
																										socket.emit( 'error', error);                               
																									}
																								} );
																						}
																					} );
																				one_success = true;
																			} catch (err) {
																			}
																		}
																		if(!one_success) {
																			mysql.query('DELETE FROM categories WHERE id=?', [category_id],
																				function(err, result, fields) {
																					if (err) {    
																						var error = {"message": "Invalid sql query 6: "+ err, "code": "20"};
																						socket.emit( 'error', error);    
																					}
																				} );
																		} else {
																			var success = {"message": "Category successfully created", "code": "2"};
																			socket.emit('success', success);
																		}
																	}
																} );
														}
													} );
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

module.exports.add_category = add_category;
