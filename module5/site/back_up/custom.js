var token = "";
var admin = false;
var is_edit_category = false;
var clicked_category;
var clicked_event;
var second_button;
var socket;

function errorMessage(data) {
	$("#error_dialog").text(data.message);
	$("#error_dialog").dialog("open");
}

function showLogged() {
	socket.emit("status_request");	
	console.log("status_request");
}

function close_btn(text_) {
	return {
        text: text_,        
        click: function() {
          	$(this).dialog("close");
        }    
	};
}

function emit_btn(socket, text_, cmd_, func) {
	return {
		text: text_,
		click: function() {
			var data_ = func();
			console.log(data_);
			socket.emit(cmd_, data_);
		} 
	};
}

$(document).ready(function() {
	socket = io.connect('http://ec2-50-17-138-98.compute-1.amazonaws.com:8080');
	$(document).click(function (event) {
		if(!second_button) {
			$(".second_button").hide();
		}
		second_button = false;
	});
	$(".second_button").bind("contextmenu", function(event) {
		return false;
	});
	
	$(".home-link").click(function(event) {
		showLogged();
	});

	socket.on("status_response", function(data) {
		console.log("status_response");
		console.log(data);
		admin = false;
		if (data.stat == 0) { //unlogged
			$(".unlogged").show();
			$(".logged").hide();	
		} else { //logged
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
				second_button = true;
				clicked_category = this.id.split("-")[1];
				$(".edit_category_id").attr("value", this.id.split("-")[1])
				if(event.which == 3) {
					$("#category_second_button").css({top: event.pageY, left: event.pageX}).show();
				}
			} );
		}
	});
        $(".delete_category").click( function(event) {
		socket.emit("del_category", {"category_id": clicked_category, "token": token});
        } );

	socket.on("rooms_response", function(data) {
		console.log(data);
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
	} );
	socket.on("game_response", function(data) {
		console.log(data);
	} );

	socket.on("edit_category_dialog_response", function(data) {
		$("#category_name_new_category").val(data.name);
		$("#words_new_category").val(data.words.join("\r\n"));
		$("#id_edit_category").val(data.category_id); 
		is_edit_category = true;
		$("#new_category_dialog").dialog("open");
	});
	
	socket.on("room_closed", function(data) {
		socket.emit("closed_room", {"token": token});
		console.log("Room closed, exit now");
	});
	
	//socket response
	socket.on("error", function(data) {
		console.log(data);
		if (data.code == "0") {
			$("#signup_dialog").dialog("close");
			$("#new_category_dialog").dialog("close");
			$("#change_password_dialog").dialog("close");
			$("#lost_password_dialog").dialog("close");
		}
		if (data.code == "2") { //signup
			$("#signup_dialog").dialog("close");
		} 
		//if (data.code == "3") {} //logout
		if (data.code == "5") { //new_category
			$("#new_category_dialog").dialog("close");
		}
		if (data.code == "10") { //edit_category
			$("#new_category_dialog").dialog("close");
		}
		if (data.code == "14") { //change_password
			$("#change_password_dialog").dialog("close");
		}
        	if (data.code == "15") { //lost_password
			$("#lost_password_dialog").dialog("close");
        	}
		errorMessage(data);	
	});
	socket.on("success", function(data) {
		console.log(data);
		if (data.code == "2") { //signup
			$("#signup_dialog").dialog("close");
			$("#signup_form")[0].reset();
		}
		if (data.code == "3") { //logout
			showLogged();
		}
		if (data.code == "4") { //login
			showLogged();
			$(".login-form")[0].reset();
		}
		if (data.code == "5") { //new_category
			$("#new_category_dialog").dialog("close");
		}
		if (data.code == "10") { //edit_category
			$("#new_category_dialog").dialog("close");
		}
		if (data.code == "11") { //create_room
			$("#chat_output").val("Welcome to the game!\nThanks for creating it!\n"); 
			$("#new_room_dialog").dialog("close");
		}
		if (data.code == "12") { //join_room
			$("#chat_output").val("Welcome to the game!\n"); 
		}
		if (data.code == "14") { //change_password
			$("#change_password_dialog").dialog("close");
			$("#change_password_form")[0].reset();
		}
		if (data.code == "15") { //lost_password
			$("#lost_password_dialog").dialog("close");
			$("#lost_password_form")[0].reset();
		}
		showLogged();	
	});

	//dialogs	
	//signup dialog
	$("#signup_dialog").dialog({ autoOpen: false }, { 
        buttons: [
			emit_btn(socket, "Sign up", "signup", function() { return $("#signup_form").serialize(); }),
			close_btn("Cancel")
		]
    });
	//error dialog
	$("#error_dialog").dialog({ autoOpen: false }, { 
		buttons: [close_btn("Ok")]
    });
	

	//change password dialog
	$("#change_password_dialog").dialog({ autoOpen: false }, {
        buttons: [
			emit_btn(socket, "Submit", "change_password", function() { return $("#change_password_form").serialize(); }),
			close_btn("Cancel")			
        ] 
    });
	$("#new_room_dialog").dialog({ autoOpen: false }, {
		buttons: [
			emit_btn(socket, "Submit", "create_room", function() { return $("#new_room_form").serialize(); }),
			close_btn("Cancel")
		]
	});
	$(".change_password_button").click(function(event) {
		$("#change_password_form")[0].reset();
		$("#change_password_dialog").dialog("open");
	});
	//lost password dialog
	$("#lost_password_dialog").dialog({ autoOpen: false }, { 
		buttons: [
            emit_btn(socket, "Submit", "lost_password", function() { return $("#lost_password_form").serialize();}),	
			close_btn("Cancel")
        ] 
    });
	$(".lost_password_button").click(function(event) {
		$("#lost_password_form")[0].reset();
		$("#lost_password_dialog").dialog("open");
	});

	//headers
	$(".signup").click(function(event) {
		$("#signup_form")[0].reset();
		$("#signup_dialog").dialog("open");
	});
	
	$(".logout-button").click(function(event) {
		socket.emit("logout");
	});
	
	$(".submit-login").click( function(event) {
		socket.emit("login", $(".login-form").serialize());
	});
	
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

	$(".new_room").click(function(event) {
		$("#new_room_form")[0].reset();
		$("#room_time_new_room").val("60");
		$("#new_room_dialog").dialog("open");
	});
	$(".leave_room").click(function(event) {
		socket.emit("leave_room", {"token": token});
    });

    $("#chat_msg").keypress(function(event) {
        if( event.keyCode === 13 ) { //if enter is pressed
            sendMsg();
        }
    });
    $("#btn_send_chat_msg").click(function() {
        sendMsg();
    });
    function sendMsg() {
		var data = {"msg": $("#chat_msg").val(), "token": token}
        socket.emit( 'chat_msg', data);
        $("#chat_msg").val('');
    }
    socket.on('chat_response', function( data ) { 
		console.log("Chat response");
		console.log(data);
    	$("#chat_output").val($("#chat_output").val() + data.time + " - " + data.sender + ":" + data.msg + '\n'); 
		$("#chat_output").scrollTop($("#chat_output")[0].scrollHeight - $("#chat_output").height());
    });
	
	//right bar
	$("#new_category_dialog").dialog({ autoOpen: false }, { 
		buttons: [	
			{
				text: "Submit",
				click: function() {
					if(!is_edit_category) {
						socket.emit("add_category", $("#new_category_form").serialize());
					} else {
						socket.emit("edit_category", $("#new_category_form").serialize());
					}
				} 
			}, close_btn("Cancel")
		] 
	});

	
	showLogged();
} );
