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
    server      = null,
    cookie = require("cookie"),
    MemoryStore = express.session.MemoryStore,
    sessionStore= new MemoryStore();

app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({
       secret: 'iaa_secret', 
       key: 'express.sid'//,
    }));
    app.use(express.static(__dirname));
});

var s = app.listen(8080);

server = io.listen(s).set( 'log level', 1 );

server.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
        data.cookie = cookie.parse(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
    } else {
        return accept('No cookie transmitted.', false);
    }
    accept(null, true);

});


var signup                       = require("./server_signup").signup,
    status_request               = require("./server_status_request").status_request,
    logout                       = require("./server_logout").logout,
    login                        = require("./server_login").login,
    lost_password                = require("./server_lost_password").lost_password,
    change_password              = require("./server_change_password").change_password,
    categories_request           = require("./server_categories_request").categories_request,
    rooms_request                = require("./server_rooms_request").rooms_request,
    game_request                 = require("./server_game_request").game_request,
    add_category                 = require("./server_add_category").add_category,
    edit_category                = require("./server_edit_category").edit_category,
    del_category                 = require("./server_del_category").del_category,
    create_room                  = require("./server_create_room").create_room,
    join_room                    = require("./server_join_room").join_room,
    leave_room                   = require("./server_leave_room").leave_room,
    closed_room                  = require("./server_closed_room").closed_room,
    add_friend                   = require("./server_add_friend").add_friend,
    edit_category_dialog_request = require("./server_edit_category_dialog_request").edit_category_dialog_request,
    chat_msg                     = require("./server_chat_msg").chat_msg,
    disconnect                   = require("./server_disconnect").disconnect,
    get_word                     = require("./server_get_word").get_word,
    add_admin                    = require("./server_admin").add_admin;

var rooms = {};
var room_id = 0;

var sessions = {};

var functions = require("./server_functions"),
	is_logged = functions.is_logged,
	in_room   = functions.in_room,
	xss       = functions.xss;

server.sockets.on( 'connection', function( socket ) {
    var hs = socket.handshake;
    
    if (sessions[hs.sessionID] == undefined) {
        socket.user = {};
        socket.user.is_logged = false;
        socket.user.in_room = false;
        sessions[hs.sessionID] = socket.user;
    } else {
        socket.user = sessions[hs.sessionID];
    }
 
	
    status_request (socket, mysql);
    signup (socket, mysql);
    logout (socket, sessions, hs.sessionID, rooms); 
    login (socket, mysql);
    lost_password (socket, mysql);
    change_password (socket, mysql);
    categories_request (socket, mysql);
    rooms_request (socket, mysql, rooms);
    game_request (socket, mysql, rooms);
    add_category (socket, mysql);
    edit_category (socket, mysql);
    del_category (socket, mysql);
    create_room (socket, mysql, rooms, room_id);
    join_room (socket, mysql, rooms, room_id);
    leave_room (socket, mysql, rooms);
    closed_room (socket, mysql);
    add_friend (socket, mysql, rooms);
    edit_category_dialog_request (socket, mysql);
    chat_msg (socket, mysql, rooms);
    disconnect (socket, mysql, rooms);
    add_admin (socket, mysql, rooms);
	
	socket.on('get_timer', function(data) {
		if (!socket.user.is_logged || !socket.user.in_room) {
			socket.emit("delete_timer_interval");
			return;
		}
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "50"});
			return;
		} 
		var time = (rooms[socket.user.room.id].drawing_time - Math.floor(((new Date).getTime() - rooms[socket.user.room.id].timer)/1000));
		if(time > 0) {
			//console.log((new Date).getTime() - rooms[socket.user.room.id].timer);
			socket.emit("update_timer", time);
		} else { //time over
			socket.emit("delete_timer_interval");
			
			var d = new Date();
			var time = d.getHours() + ":" + d.getMinutes();
			chat_response = {"sender": "", "msg": "Time over, no one got it right", "time": time};
			socket.broadcast.to('room' + socket.user.room.id).emit( 'chat_response', chat_response);
			socket.emit( 'chat_response', chat_response);
			
			get_word (socket, mysql, rooms);
		}
	} );
	
	socket.on('drawing', function(data) {
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "50"});
			return;
		} 
		
		delete data.token;
		socket.broadcast.to('room' + socket.user.room.id).emit('draw_update', data);
	});

	socket.on('erase', function(data){
		if(data.token != socket.user.token) {
			socket.emit('error', {"message": "Invalid request", "code": "58"});
			return;
		} 
		
		delete data.token;
		socket.broadcast.to('room' + socket.user.room.id).emit('erase', data);
	});

});

sys.puts( "Server is running on 8080" );

