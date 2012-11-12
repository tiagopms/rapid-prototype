var categories_request = function(socket, mysql, check, sanitize, querystring) {
	socket.on("categories_request", function() {
		mysql.query('SELECT id, name FROM categories',
			function(err, result, fields) {
				if (err) {
					var error = {"message": "Invalid sql query: "+ err, "code": "10"};
					socket.emit( 'error', error);
				} else {
					socket.emit( 'categories_response', result);
				}
			});
	} );
};

module.exports.categories_request = categories_request;
