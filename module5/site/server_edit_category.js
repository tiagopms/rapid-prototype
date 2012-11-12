var functions     = require("./server_functions"),
	is_logged     = functions.is_logged,
	xss           = functions.xss,
	valid_entries = functions.valid_entries,
	check         = require("validator").check,
	querystring   = require("querystring");

var edit_category = function(socket, mysql) {
	socket.on("edit_category", function(data) {
		
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		
		data = querystring.parse(data);
		
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "29"});
			return;
		} 

		var validEntries = valid_entries(socket, "29", function() {
			check(data.name, "Invalid name").isAlphanumeric().len(3,20);
		});
		if(!validEntries) {
			return;
		}
		
		if (!socket.user.admin) {
			socket.emit('emit', {"message": "Invalid attempt, needs to be admin", "code": "29"});
			return;
		}

		mysql.query(
			'SELECT count(*) as found FROM categories WHERE id=?',
			[xss(data.category_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': "29"});
					return;
				}
				if (result[0].found == 0) {
					socket.emit('error', {"message": "This category doesn't exist", "code": "29"});
					return;
				}
				mysql.query(
					'UPDATE categories SET name=? WHERE id=?',
					[xss(data.name), xss(data.category_id)],
					function(err, result, fields) { 
						if (err) {
							socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': '29'});
							return;
						}
						var words = data.words.split(/\r\n/);
						mysql.query(
							'DELETE FROM words WHERE category_id=?',
							[xss(data.category_id)],
							function(err, result, fields) {
								if (err) {
									socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': "29"}); 
									return;
								}
								var category_id = data.category_id;
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
									socket.emit('error', {'message': 'No words could be added to the category. The category was removed.', 'code': "29"});
									return;
								}
								socket.emit('success', {"message": "Category successfully edited", "code": "29"});
							}
						);
					}
				);
			}
		);

	});
};

module.exports.edit_category = edit_category;
