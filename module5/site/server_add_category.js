var functions     = require("./server_functions"),
	is_logged     = functions.is_logged,
	xss           = functions.xss,
	valid_entries = functions.valid_entries,
	check         = require("validator").check,
	querystring   = require("querystring");

var add_category = function(socket, mysql) {
	socket.on("add_category", function(data) {
		
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		data = querystring.parse(data);
		
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "20"});
			return;
		} 

		var validEntries = valid_entries(socket, "20", function() {
			check(data.name, "Invalid name").isAlphanumeric().len(3,20);
		});
		if(!validEntries) {
			return;
		}
		
		if (!socket.user.admin) {
			socket.emit('emit', {"message": "Invalid attempt, needs to be admin", "code": "20"});
			return;
		}

		mysql.query(
			'SELECT count(*) as found FROM categories WHERE name=?',
			[xss(data.name)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': "20"});
					return;
				}
				if (result[0].found == 1) {
					socket.emit('error', {"message": "This category already exists", "code": "20"});
					return;
				}
				mysql.query(
					'INSERT INTO categories (name) VALUES (?)',
					[xss(data.name)],
					function(err, result, fields) { 
						if (err) {
							socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': '20'});
							return;
						}
						var words = data.words.split(/\r\n/);
						mysql.query(
							'SELECT id FROM categories WHERE name=?',
							[xss(data.name)],
							function(err, result, fields) {
								if (err) {
									socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': "20"}); 
									return;
								}
								category_id = result[0].id;
								var one_success = false;
								for (var i in words) {
									try {
										check(words[i], "Invalid word " + words[i]).len(1, 200).notEmpty();
										mysql.query(
											'INSERT INTO words (word, category_id) values (?, ?)',
											[xss(words[i]), xss(category_id)],
											function(err, result, fields) {
												if (!err) {
													one_success=true;
												}
											}
										);
										one_success = true;
									} catch (ex) {
									}
								}
								if (!one_success){
									mysql.query(
										'DELETE FROM categories WHERE id=?',
										[xss(category_id)],
										function(err, result, fields) {
											
										}
									);
									socket.emit('error', {'message': 'No words could be added to the category', 'code': "20"});
									return;
								}
								socket.emit('success', {"message": "Category successfully created", "code": "20"});
							}
						);
					}
				);
			}
		);

	});
};

module.exports.add_category = add_category;
