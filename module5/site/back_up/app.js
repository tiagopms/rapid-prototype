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

var is_logged = require("./server_functions").is_logged;
var isnt_logged = require("./server_functions").isnt_logged;

var signup         = require("./server_signup").signup,
    status_request = require("./server_status_request").status_request,
    logout         = require("./server_logout").logout,
    login          = require("./server_login").login,
    lost_password  = require("./server_lost_password").lost_password,
    categories_request = require("./server_categories_request").categories_request,
    rooms_request = require("./server_rooms_request").rooms_request,
    game_request = require("./server_game_request").game_request,
    add_category = require("./server_add_category").add_category,
    edit_category = require("./server_edit_category").edit_category,
    del_category = require("./server_del_category").del_category,
    create_room = require("./server_create_room").create_room,
    join_room = require("./server_join_room").join_room,
    leave_room = require("./server_leave_room").leave_room,
    closed_room = require("./server_closed_room").closed_room,
    edit_category_dialog_request = require("./server_edit_category_dialog_request").edit_category_dialog_request;
    chat_msg = require("./server_chat_msg").chat_msg;
    disconnect = require("./server_disconnect").disconnect;

var rooms = {};
var room_id = 0;

var sessions = {};

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
 
	
    status_request (socket, mysql, check, sanitize, querystring);
    signup (socket, mysql);
    logout (socket, sessions, hs.sessionID); 
    login (socket, mysql);
    lost_password (socket, mysql, check, sanitize, querystring);
    categories_request (socket, mysql, check, sanitize, querystring);
    rooms_request (socket, mysql, check, sanitize, querystring, rooms);
    game_request (socket, mysql, check, sanitize, querystring, rooms);
    add_category (socket, mysql, check, sanitize, querystring);
    edit_category (socket, mysql, check, sanitize, querystring);
    del_category (socket, mysql, check, sanitize, querystring);
    create_room (socket, mysql, rooms, room_id);
    join_room (socket, mysql, check, sanitize, querystring, rooms, room_id);
    leave_room (socket, mysql, check, sanitize, querystring, rooms);
    closed_room (socket, mysql, check, sanitize, querystring, rooms);
    edit_category_dialog_request (socket, mysql, check, sanitize, querystring, rooms);
    chat_msg (socket, mysql, check, sanitize, querystring, rooms);
    disconnect (socket, mysql, check, sanitize, querystring, rooms);
	
});

sys.puts( "Server is running on 8080" );

