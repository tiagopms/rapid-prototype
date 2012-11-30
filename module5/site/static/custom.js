var token = "";
var admin = false;
var is_edit_category = false;
var clicked_category;
var clicked_user;
var second_button;
var socket;
var is_logged;
var timer_interval;
var current_color = "#000000";
var current_size = 2;
var current_drawer = -1;
var drawing = false,
	drawer = false,
	prev = {},
	last_emit = (new Date).getTime();
	
	    

function errorMessage(data) {
	$("#error_dialog").text(data.message);
	$("#error_dialog").dialog("open");
};

function showLogged() {
	socket.emit("status_request");	
};

function close_btn(text_) {
	return {
        text: text_,        
        click: function() {
          	$(this).dialog("close");
        }    
	};
};

function emit_btn(socket, text_, cmd_, func) {
	return {
		text: text_,
		click: function() {
			var data_ = func();
			socket.emit(cmd_, data_);
		} 
	};
};

function btn(text, func) {
	return {
		text: text,
		click: func
	};
};

function draw_line(ctx, start_x, start_y, end_x, end_y, color, size) {
	ctx.lineCap = 'round'; 
	ctx.lineWidth = size;
	ctx.strokeStyle = color;
	ctx.beginPath();
	//ctx.moveTo(start_x - $("#paper").offset().left , start_y - $("#paper").offset().top);
	//ctx.lineTo(end_x - $("#paper").offset().left,end_y - $("#paper").offset().top );
	ctx.moveTo(start_x  , start_y );
	ctx.lineTo(end_x ,end_y  );
	ctx.stroke();
};

function getPosition(e) {
	/*var targ;
	if (!e)
		e = window.event;
	if (e.target)
		targ = e.target;
	else if (e.srcElement)
		targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;
	var x = e.pageX - $(targ).offset().left;
	var y = e.pageY - $(targ).offset().top;*/
    var x = e.pageX;
    var y = e.pageY;

    var canvas = $("#paper");
	x -= canvas.offset().left;
	y -= canvas.offset().top;
	var result = {"x": x, "y": y};
	return result;
};

function submit_login(event) {
	socket.emit("login", $(".login-form").serialize());
};

function submit_lost_password() {
	socket.emit("lost_password", $("#lost_password_form").serialize());
};

function submit_category() {
	if(!is_edit_category) {
		socket.emit("add_category", $("#new_category_form").serialize());
	} else {
		socket.emit("edit_category", $("#new_category_form").serialize());
	}
}; 

function submit_logout() {
	socket.emit("logout");
}

function submit_change_password() {
	socket.emit("change_password", $("#change_password_form").serialize());
}

function submit_new_room() {
	socket.emit("create_room", $("#new_room_form").serialize());
}

function submit_signup() {
	socket.emit("signup", $("#signup_form").serialize());
}

function submit_add_friend_form() {
	socket.emit("add_friend", {
		form: $("#add_friend_form").serialize(), 
		is_form: true
	}); 
}

function sendMsg() {
	var data = {"msg": $("#chat_msg").val(), "token": token}
	socket.emit( 'chat_msg', data);
	$("#chat_msg").val('');
};


function key_submit(func) {
	return function(e) {
		if (e.which == 13) {
			func();
			return false;
		}
	};
};


function none() {};

$(document).ready(function() {
	socket = io.connect('http://ec2-50-17-138-98.compute-1.amazonaws.com:8080');
	
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}
	var canvas = $('#paper'),
		ctx = canvas[0].getContext('2d');
	

	// Second Button
	$(document).click(function (event) {
		if(!second_button) {
			$(".second_button").hide();
		}
		second_button = false;
	});
	$(".second_button").bind("contextmenu", function(event) {
		return false;
	});
	


	// Home link
	$(".home-link").click(function(event) {
		showLogged();
	});


	// Socket response
	socket.on("draw_update", function(data) {
		if (data.drawing) {
			draw_line(ctx, prev.x, prev.y, data.x, data.y, data.color, data.size);
		}

		prev.x = data.x;
		prev.y = data.y;

	});

	socket.on("status_response", function(data) {
		admin = false;
		if (data.stat == 0) { //unlogged
			$(".unlogged").show();
			$(".logged").hide();
			is_logged = false;
		} else { //logged
			is_logged = true;
			socket.emit("categories_request");
			token = data.user.token;
			$(".token").attr("value", token);
			$(".logged").show();
			$(".unlogged").hide();
			$(".header-img").attr("src","http://en.gravatar.com/avatar/" + data.user.gravatar + "?s=70&amp;d=mm");
			$(".welcome").html("Hello, " + data.user.username + "!");
			if (data.stat == 1) { //outside room
				socket.emit("rooms_request");
				$(".outside_room").show();
				$(".in_room").hide();
			} else { //inside room
				socket.emit("game_request");
				$(".outside_room").hide();
				$(".in_room").show();
			}
			if (data.user.admin) {
				$(".admin").show();
				admin = true;
			} else {
				$(".admin").hide();
			}
		}	
	});

	socket.on("categories_response", function(data) {
		$(".category_select").html("");
		$(".aside-categories").html("");
		$(".aside-categories").append("<li><a href\"#\" class=\"all_categories\">All categories</a></li>");
		$(".category_select").append('<option value="-1">Any Category</option>');
		for(count in data) {
			$(".aside-categories").append("<li><a href\"#\" class=\"category_item clicked\" id=\"category-"+data[count].id+"\">" + data[count].name + "</a></li>");
			$(".category_select").append('<option value="'+data[count].id+'">'+data[count].name+'</option>');
		}
		
		$(".room_item").show();
		
		$(".all_categories").click(function(element) {
			$(".room_item").show();
			$(".category_item:not(.clicked)").addClass("clicked");
		});
		$(".category_item").click(function(element) {
			$("." + this.id).toggle();
			
			if(!$(this).hasClass("clicked")) {
				$(this).addClass("clicked");
			} else {
				$(this).removeClass("clicked");
			}
		});
		if(admin) {
			$(".category_item").bind("contextmenu", function(event) {
				return false;
			} );
			$(".category_item").mousedown(function (event) {
				ientYecond_button = true;
				clicked_category = this.id.split("-")[1];
				$(".edit_category_id").attr("value", this.id.split("-")[1])
				if(event.which == 3) {
					$("#category_second_button").css({top: event.pageY, left: event.pageX}).show();
				}
			} );
		}
	});

	socket.on("added_as_friend", function(data) {
		$("#add_friend_form")[0].reset();
		$(".user_id_add_friend").val(data.user_id);
		$(".is_friend_add_friend").val(true);
		$("#add_friend_text").text(data.msg);
		$("#answer_add_friend_dialog").dialog("open");
	});

	socket.on("rooms_response", function(data) {
		$(".rooms_list").html('<li class="head"><div class="room_row"><div class="room_name">Name</div><div class="room_category">Category</div><div class="room_host">Host</div></div></li>');
		for (count in data) {
			var friend = data[count].is_friend? " host_friend": "";
			var priv = data[count].private? " private_room": "";
			$(".rooms_list").append(
				'<li class="category-' + data[count].category + ' room_item' + priv + '">' +
					'<a href="#" class="room_link room_row" id="room-' + data[count].id + '">' +
						'<div class="room_name' + friend +'">' + data[count].name +'</div>' +
						'<div class="room_category">' + data[count].category_name + '</div>' +
						'<div class="room_host">' + data[count].host_name + '</div>' + 
					'</a>' +
				'</li>'
			);
		}
		$(".room_link").click(function(element) {
			socket.emit("join_room", {"room_id": this.id.split("-")[1], "token": token});
		});
	});
	
	socket.on("game_response", function(data) {
		
console.log("Game response!")
console.log(data)
		$(".room_title").html(data.name);
		$(".aside-users").html("");
		for(count in data.users) {
			var is_friend = "";
			var is_drawer = "";
			if(data.users[count].is_friend)
				is_friend = " is_friend";
			if(count == data.my_id)
				is_friend = " is_me";
			if (count == current_drawer) 
				is_drawer = " is_drawer";
			$(".aside-users").append(
				"<li>"+
					"<a href=\"#\" class=\"user_item" + is_friend + is_drawer + "\" id=\"user-"+ count +"\">"+
						"<img class=\"room_user_image\" src=\"http://en.gravatar.com/avatar/"+data.users[count].gravatar+"?s=30&amp;d=mm\">"+
						"<span class=\"room_username\">" + data.users[count].name + "</span>"+
						"<span class=\"room_user_points\">" +data.users[count].points + "</span>"+
						"<span class=\"clear\"></span>"+
					"</a>"+
				"</li>"
			);
		}
		
		$(".user_item").show();
		
		$(".user_item:not(.is_me)").bind("contextmenu", function(event) {
			return false;
		} );
		$(".user_item:not(.is_me, .is_friend)").mousedown(function (event) {
			second_button = true;
			clicked_user = this.id.split("-")[1];
			if(event.which == 3) {
				$(".add_friend_user").show();
				$("#user_second_button").css({top: event.pageY, left: event.pageX}).show();
			}
		} );
		$(".user_item.is_friend:not(.is_me)").mousedown(function (event) {
			second_button = true;
			clicked_user = this.id.split("-")[1];
			if(event.which == 3) {
				$(".add_friend_user").hide();
				$("#user_second_button").css({top: event.pageY, left: event.pageX}).show();
			}
		} );

		timer_interval = setInterval(function oi(){
			socket.emit("get_timer", {token: token});
		},500);
	});
	
	socket.on("update_users", function(data) {
		console.log("update_users");
		socket.emit("users_request");
	});

	socket.on("users_response", function(data) {
		console.log(data);
		console.log("users_response");
		$(".aside-users-outside").html("");
		for(count in data) {
			var is_friend = "";
			if(data[count].is_friend)
				is_friend = " is_friend";
			if(data[count].my_id)
				is_friend = " is_me";
			$(".aside-users-outside").append(
				"<li>"+
					"<a href=\"#\" class=\"user_item" + is_friend + "\" id=\"user-"+ count +"\">"+
						"<img class=\"room_user_image\" src=\"http://en.gravatar.com/avatar/"+data[count].gravatar+"?s=30&amp;d=mm\">"+
						"<span class=\"room_username\">" + data[count].name + "</span>"+
						"<span class=\"clear\"></span>"+
					"</a>"+
				"</li>"
			);
		}
		
		$(".user_item").show();
		
		$(".user_item:not(.is_me)").bind("contextmenu", function(event) {
			return false;
		} );
		$(".user_item:not(.is_me, .is_friend)").mousedown(function (event) {
			second_button = true;
			clicked_user = this.id.split("-")[1];
			if(event.which == 3) {
				$(".add_friend_user").show();
				$("#user_second_button").css({top: event.pageY, left: event.pageX}).show();
			}
		} );
		$(".user_item.is_friend:not(.is_me)").mousedown(function (event) {
			second_button = true;
			clicked_user = this.id.split("-")[1];
			if(event.which == 3) {
				$(".add_friend_user").hide();
				$("#user_second_button").css({top: event.pageY, left: event.pageX}).show();
			}
		} );

		timer_interval = setInterval(function oi(){
			socket.emit("get_timer", {token: token});
		},500);
	});

	socket.on("update_timer", function(data) {
		if($(".draw_timer").text() != data)
			$(".draw_timer").html(data);
	});

	socket.on("delete_timer_interval", function(data) {
		drawing = false;
		drawer = false;
		clearInterval(timer_interval);
	});

	socket.on("new_round", function(data) {
console.log("New round!");
		drawer = false;
		drawing = false;
		$(".room_word").html("");
		$(".give_up_btn").hide();
		timer_interval = setInterval(function (){
			socket.emit("get_timer", {token: token});
		},500);
		current_drawer = data;
		$(".user_item").removeClass("is_drawer");
		$("#user-"+current_drawer).addClass("is_drawer");
		ctx.clearRect (0, 0, canvas[0].width, canvas[0].height);
	});

	socket.on("drawing_word", function(data) {
		console.log("drawing_word");
		console.log(data);
		drawer = true;
		$(".room_word").show();
		$(".give_up_btn").show();
		$(".room_word").html("<span class=\"room_word_general\">Your word is:</span><span class=\"room_word_specific\">" + data + "</span>");
	});
	
	socket.on("edit_category_dialog_response", function(data) {
		$("#category_name_new_category").val(data.name);
		$("#words_new_category").val(data.words.join("\r\n"));
		$(".category_id_edit_category").val(data.category_id); 
		is_edit_category = true;
		$("#new_category_dialog").dialog("open");
	});
	
	socket.on("room_closed", function(data) {
		socket.emit("closed_room", {"token": token});
	});
	
	socket.on("error", function(data) {
		console.log(data.code);
		$(".ui-dialog-content").dialog("close");
		if (data.code == "29") { //edit_category
			if (is_logged) {
				socket.emit("categories_request");
			}
		}
		errorMessage(data);	
	});
	
	socket.on("success", function(data) {
		$(".ui-dialog-content:not(#error_dialog)").dialog("close");
		if (data.code == "2") { //signup
			$("#signup_form")[0].reset();
		}
		if (data.code == "11") { //create_room
			$("#chat_output").val("Welcome to the game!\nThanks for creating it!\n"); 
		}
		if (data.code == "19") { //join_room
			ctx.clearRect (0, 0, canvas[0].width, canvas[0].height);
			$(".room_word").hide();
			$(".give_up_btn").hide();
console.log("Join!");
			$("#chat_output").val("Welcome to the game!\n"); 
		}
		if (data.code == "14") { //change_password
			$("#change_password_form")[0].reset();
		}
		if (data.code == "15") { //lost_password
			$("#lost_password_form")[0].reset();
		}
		showLogged();	
	});
	
	socket.on("update", function() {
		showLogged();	
	});
	
	socket.on("baned", function() {
		socket.emit("leave_room", {"token": token});
	});

	socket.on("erase", function(data) {
		ctx.clearRect (0, 0, canvas[0].width, canvas[0].height);
	});


	//Signup
	$("#signup_form").keypress(key_submit(submit_signup));
	$("#signup_dialog").dialog({ autoOpen: false, modal: true }, { 
        buttons: [
			btn("Sign up", submit_signup),
			close_btn("Cancel")
		]
    });
	
	
	//Error
	$("#error_dialog").dialog({ autoOpen: false, modal: true }, { 
		buttons: [close_btn("Ok")]
    });
	

	//Change Password
	$("#change_password_form input").keypress(key_submit(submit_change_password));
	$("#change_password_dialog").dialog({ autoOpen: false, modal: true }, {
        buttons: [
			btn("Submit", submit_change_password),
			close_btn("Cancel")			
        ] 
    });

	$(".change_password_button").click(function(event) {
		$("#change_password_form")[0].reset();
		$("#change_password_dialog").dialog("open");
	});


	//Lost Password
	$("#lost_password_form input").keypress(key_submit(submit_lost_password));
	$("#lost_password_dialog").dialog({ autoOpen: false, modal: true }, { 
		buttons: [
            btn("Submit", submit_lost_password),	
			close_btn("Cancel")
        ] 
    });
	$(".lost_password_button").click(function(event) {
		$("#lost_password_form")[0].reset();
		$("#lost_password_dialog").dialog("open");
	});


	//Drawing
	canvas[0].addEventListener('mousemove', function(e){
		var current_time = (new Date).getTime();
		p = getPosition(e);
		if(drawer) {
			if ((current_time - last_emit) > 50) {
				socket.emit("drawing", {'x': p.x,
										'y': p.y,
										'color': current_color,
										'size': current_size,
										'drawing': drawing,
										token: token});
				last_emit = current_time;
			}
			if(drawing) {
				draw_line(ctx, prev.x, prev.y, p.x, p.y, current_color, current_size);
				prev.x = p.x;
				prev.y = p.y;
			}
		}
	}, false);
	
	canvas[0].addEventListener('mousedown',function(e) {
		if (drawer){
			p = getPosition(e);
			e.preventDefault();
			drawing = true;
			prev.x = p.x;
			prev.y = p.y;
		}
	}, false);

	$(document).bind('mouseup mouseleave', function(){
		drawing = false;
	});

	$(".erase").click(function(evt) {
		if (drawer) {
			ctx.clearRect (0, 0, canvas[0].width, canvas[0].height);
			socket.emit("erase", {token:token});
		}
	});

	$(".color").click(function(evt) {
		if (drawer) {
			current_color = "#" + this.id.split("-")[1];
		}
	});
	$(".size").click(function(evt) {
		if (drawer) {
			if (this.id == "size1") {
				current_size = 2;
			} else if (this.id == "size2") {
				current_size = 8;
			} else if (this.id == "size3") {
				current_size = 16;
			} else if (this.id == "size4") {
				current_size = 32;
			}
		}
	});


	// Search
	$(".search_input").keypress(key_submit(none));

	$(".search_input").keyup(function(evt) {
		input = $(this);
		$(".room_item").show();
		if (input.val() != "") {
			var rows = $(".room_item");
			for (var i = 0; i < rows.length; i++) {
				row = rows[i];
				var classes = row.className.split(/\s/);
				for (var j = 0, len = classes.length; i < len; i++){
					if(/^category/.test(classes[i])) {
						if (classes[i] != "category--1") {
							if (!$("#"+classes[i]).hasClass("clicked")) {
								$(row).hide();
							}
						}
					}
				}
				if (($(row).find(".room_name").text().indexOf(input.val()) == -1) && ($(row).find(".room_host").text().indexOf(input.val()) == -1)) {
					$(row).hide();
				}

			}
		}
	});


	// Signup
	$(".signup").click(function(event) {
		$("#signup_form")[0].reset();
		$("#signup_dialog").dialog("open");
	});
	

	// Logout
	$(".logout-button").click(submit_logout);


	// Login
	$(".submit-login").click(submit_login);
	$(".login-form input").keypress(key_submit(submit_login));
	

	// New Room
	$(".new_room").click(function(event) {
		$("#new_room_form")[0].reset();
		$("#room_time_new_room").val("90");
		$("#new_room_dialog").dialog("open");
	});

	$("#new_room_form input").keypress(key_submit(submit_new_room));
	$("#new_room_dialog").dialog({ autoOpen: false, modal: true }, {
		buttons: [
			btn("Submit", submit_new_room),
			close_btn("Cancel")
		]
	});


	// Leave Room
	$(".leave_room").click(function(event) {
		socket.emit("leave_room", {"token": token});
    });
	$(".give_up_btn").click(function(event) {
		socket.emit("give_up", {"token": token});
	});



	// Chat
    $("#chat_msg").keypress(key_submit(sendMsg));
    
	$("#btn_send_chat_msg").click(sendMsg);
    socket.on('chat_response', function( data ) { 
    	$("#chat_output").val($("#chat_output").val() + data.time + " - " + data.sender + ":" + data.msg + '\n'); 
		$("#chat_output").scrollTop($("#chat_output")[0].scrollHeight - $("#chat_output").height());
    });


	// Category 
	$("#new_category_dialog").dialog({ autoOpen: false, width: 700, height: 600, modal: true }, { 
		buttons: [	
			btn("Submit", submit_category), 
			close_btn("Cancel")
		] 
	});
	$("#new_category_form input").keypress(key_submit(submit_category));
     
	$(".new_category").click(function(event) {
		$("#new_category_form")[0].reset();
		$("#new_category_dialog").dialog('option', 'title', 'New Category');
		is_edit_category = false;
		$("#new_category_dialog").dialog("open");
	});

	$(".edit_category").click(function(event) {
		$("#new_category_form")[0].reset();
		$("#new_category_dialog").dialog('option', 'title', 'Edit Category');
		socket.emit("edit_category_dialog_request", {category_id: clicked_category});
	});
	
	$(".delete_category").click( function(event) {
		socket.emit("del_category", {"category_id": clicked_category, "token": token});
	});


	// Add friend
	$("#answer_add_friend_dialog").dialog({ autoOpen: false, modal: true }, { 
        buttons: [
			btn("Add as friend", submit_add_friend_form),
			close_btn("No")
		]
    });

	$(".add_friend_user").click( function(event) {
		socket.emit("add_friend", {"user_id": clicked_user, "is_friend": true,"token": token});
	} );


	// Add admin
	$(".add_as_admin").click( function(event) {
		socket.emit("add_admin", {"new_admin_id": clicked_user,"token": token});
	} );


	// Block user
	$(".block_user").click( function(event) {
		socket.emit("add_friend", {"user_id": clicked_user, "is_friend": false,"token": token});
	} );


	// Close Dialog
	$('.ui-widget-overlay').click(function() { $(".ui-dialog-content").dialog("close"); });
$(".ui-widget-overlay").live("click", function() {  $(".ui-dialog-content").dialog("close"); } );

	// Reload	
	showLogged();
} );
