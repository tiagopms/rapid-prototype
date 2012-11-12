var sys = require( "sys" );

var _mysql = require('mysql');

var HOST = 'localhost';
var PORT = 3306;
var DATABASE = 'ImagesAndAction';

var mysql = _mysql.createConnection({
    host: HOST,
    port: PORT,
    user: 'drawing_user',
    password: 'drawing_pass',
});
mysql.connect();
mysql.query('use ' + DATABASE);

var io          = require('socket.io'),
    check       = require('validator').check,
    sanitize    = require('validator').sanitize,
    querystring = require('querystring'),
    express     = require('express'),
    app         = express(),
    http        = require('http'),
    server      = null;

app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({secret: 'iaa_secret', key: 'express.sid'}));
    app.use(express.static(__dirname));
});

app.listen(8070);
s = http.createServer(app)

server = io.listen(s).set( 'log level', 1 );

var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var signup         = require("./server_signup").signup,
    status_request = require("./server_status_request").status_request,
    logout         = require("./server_logout").logout,
    login          = require("./server_login").login,
    lost_password  = require("./server_lost_password").lost_password,
    categories_request = require("./server_categories_request").categories_request;
    create_room = require("./server_create_room").create_room;
    join_room = require("./server_join_room").join_room;

var rooms = {};
var room_id = 0;

server.sockets.on( 'connection', function( socket ) {
	socket.user = {};
	socket.user.is_logged = false;
	socket.user.in_room = false;
	
	status_request (socket, mysql, check, sanitize, querystring);
	signup (socket, mysql, check, sanitize, querystring);
	logout (socket, mysql, check, sanitize, querystring);
	login (socket, mysql, check, sanitize, querystring);
	lost_password (socket, mysql, check, sanitize, querystring);
	categories_request (socket, mysql, check, sanitize, querystring);
	create_room (socket, mysql, check, sanitize, querystring, rooms, room_id);
	join_room (socket, mysql, check, sanitize, querystring, rooms, room_id);
		
	socket.on( 'chat_msg', function( data ) {
		isnt_logged(is_logged, socket);

		if(!is_logged) {
			socket.broadcast.emit( 'chat_incMsg', data );
			socket.emit( 'chat_incMsg', data );
			console.log("Received chat message");
		}
	});
});

sys.puts( "Server is running on 8080" );

