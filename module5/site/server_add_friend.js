var functions     = require("./server_functions"),
	validator     = require("validator"),
	querystring   = require("querystring"),
	check         = validator.check,
	is_logged     = functions.is_logged,
	xss           = functions.xss,
	valid_entries = functions.valid_entries;

var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var add_friend = function(socket, mysql, rooms) {
	socket.on("add_friend", function( data ) {
		is_logged(socket.user.is_logged, socket);
		if (!socket.user.is_logged) {
			return;
		}

		var answer = false;
		if (data.is_form != undefined) {
			data = querystring.parse(data.form);
			answer = true;
		}
		
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "40"});
			return;
		} 
		var validEntries = valid_entries(socket, "40", function() {
			check(data.user_id, "Invalid user").isNumeric();
		});
		if (!validEntries) {
			return;
		}
		
		mysql.query(
			'SELECT COUNT(*) as found FROM accounts WHERE id=?', 
			[xss(data.user_id)],
			function(err, result, fields) {
				if (err) {
					socket.emit('error', {"message": "Invalid sql query: " + err, "code": "40"});
					return;
				} 
				var gadget = result[0];
				if (gadget.found != 1) {
					socket.emit('error', {"message": "Invalid attempt, user not found", "code": "40"});
					return;
				} 
				var friend = (data.is_friend)? "true" : "false";
				mysql.query(
					'DELETE FROM friends WHERE first_id=? AND second_id=?',
					[xss(socket.user.user_id), xss(data.user_id)],
					function(err, result, fields) {
						if (err) {
							socket.emit('error', {'message':'Invalid SQL query 2: ' + err, "code": "40"});
							return;
						}
						mysql.query(
							'INSERT INTO friends (first_id, second_id, is_friend) VALUES (?, ?, ?)', 
							[xss(socket.user.user_id), xss(data.user_id), xss(friend)],
							function(err, result, fields) {
								if (err) {
									socket.emit('error', {"message": "Invalid sql query 2: "+ err, "code": "40"});
									return;
								} else {
									var success = {"message": "Successfully added friend", "code": "40"};
									socket.emit( 'success', success);
								}
								if (data.is_friend && !answer) {
									console.log("Add friend final!")
									var response = {};
									response.user_id = socket.user.user_id;
									response.msg = socket.user.username + " has added you, would you like to add him back?";
									socket.broadcast.to("user" + data.user_id).emit("added_as_friend", response);
								} 
								if(!data.is_friend && (rooms[socket.user.room.id].host == socket.user.user_id)) {
									socket.broadcast.to("user" + data.user_id).emit("baned");
								}
							} 
						);
					}
				);
			}
		);
	});
};

module.exports.add_friend = add_friend;
