var functions     = require("./server_functions"),
	check         = require("validator").check,
	querystring   = require("querystring"),
	is_logged     = functions.is_logged,
	xss		      = functions.xss,
	valid_entries = functions.valid_entries;

var edit_category_dialog_request = function(socket, mysql) {
	socket.on("edit_category_dialog_request", function(data) {
		is_logged(socket.user.is_logged, socket);	
		if (!socket.user.is_logged) {
			return;
		}

		if (!socket.user.admin) {
			socket.emit('error', {"message": "Invalid attempt, needs to be admin", "code":"27"});
			return;
		}
		var validEntries = valid_entries(socket, "27", function() {
			check(data.category_id, "Invalid category").isNumeric();
		});
		if (!validEntries) {
			return;
		}

		mysql.query(
			'SELECT name FROM categories WHERE id=?', 
			[xss(data.category_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: " + err, "code": "27"});
					return;
				} 

				var category = result[0];
				if (result.length == 0) {
					socket.emit('error', {"message": "Invalid attempt, category not found", "code": "27"});
					return;
				} 
				mysql.query(
					'SELECT word from words WHERE category_id=?', 
					[xss(data.category_id)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {"message": "Invalid sql query 2: "+ err, "code": "27"});
							return;
						} 
						var words = [];
						for (var i in result) {
							words.push(result[i].word);
						}
						socket.emit("edit_category_dialog_response", {
							category_id: data.category_id,
							name: category.name,
							words: words
						});
					}
				);
			}
		);
	});
};

module.exports.edit_category_dialog_request = edit_category_dialog_request;
