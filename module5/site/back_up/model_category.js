var functions = require("./server_functions"),
	xss       = functions.xss;


function ModelCategory(socket, mysql, code) {
	return {
		exists_by_name: function(name) {
			var exists = true;
			mysql.query(
				'SELECT COUNT(*) as found FROM categories WHERE name=?',
				[xss(data.name)],
				function(err, result, fields) {
					if (err) {
						socket.emit('error', {'message': 'Invalid SQL query: ' + err, 'code': code});
						exists = null;
						return;
					}
					exists = (result.length != 0);
				}
			)
			return exists;
		},
		insert: function(name) {
			mysql.query(
				'INSERT INTO categories (name) VALUES (?)',
				[xss(name)] 
		}

			
	}
}

module.exports.ModelCategory = ModelCategory;
