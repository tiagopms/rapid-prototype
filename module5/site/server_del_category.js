var functions     = require("./server_functions"),
	validator     = require("validator"),
	is_logged     = functions.is_logged,
	xss           = functions.xss,
	check         = validator.check,
	valid_entries = functions.valid_entries;

var del_category = function(socket, mysql) {
	socket.on("del_category", function(data) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}
		

		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "25"});
			return;
		} 

		var validEntries = valid_entries(socket,"25", function() {
			check(data.category_id, "Invalid category").isNumeric();
		});
		
		if (!validEntries) {
			return;
		}

		mysql.query(
			'SELECT COUNT(*) as found FROM accounts WHERE username=? and admin=\'true\'', 
			[xss(socket.user.username)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: " + err, "code": "25"});
					return;
				} 
				if (result[0].found != 1) {
					socket.emit('error', {"message": "Invalid attempt, needs to be admin", "code": "25"});
					return;
				} 
				mysql.query(
					'DELETE FROM categories WHERE id=?', 
					[xss(data.category_id)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {"message": "Invalid sql query 3: "+ err, "code": "25"});
							return;
						} 
							
						socket.emit('success', {"message": "Category successfully deleted", "code": "25"});
					}
				);
			}
		);
	});
};

module.exports.del_category = del_category;
