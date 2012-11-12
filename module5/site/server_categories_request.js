var categories_request = function(socket, mysql) {
	socket.on("categories_request", function() {
		mysql.query(
			'SELECT id, name FROM categories',
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: "+ err, "code": "10"});
					return;
				} 
				socket.emit( 'categories_response', result);
			}
		);
	});
};

module.exports.categories_request = categories_request;
