var token = "";
var is_edit_calendar = false;
var is_edit_event = false;
var clicked_calendar;
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
		if (data.stat == 0) { //unlogged
			$(".unlogged").show();
			$(".logged").hide();	
		} else {
			socket.emit("categories_request");
			token = data.user.token;
			$(".token").attr("value", data.token);
			$(".logged").show();
			$(".unlogged").hide();
			$(".header-img").attr("src","http://en.gravatar.com/avatar/" + data.user.gravatar + "?s=70&amp;d=mm");
			$(".welcome").html("Hello, " + data.user.username + "!");
			if (data.stat == 1) { //outside room
				$(".outside_room").show();
				$(".in_room").hide();
			} else { //inside room
				$(".outside_room").hide();
				$(".in_room").show();
			}
			if (data.user.admin) {
				$(".admin").show();
			} else {
				$(".admin").hide();
			}
		}	
	});


	socket.on("categories_response", function(data) {
		
		$(".aside-categories").html("");
		for(count in data.calendars) {
			$(".aside-categories").append("<li><a href\"#\" class=\"category_item\" id=\"category-"+data.calendars[count].id+"\">" + data.calendars[count].name + "</a></li>");
		}
	
	});
	
	//socket response
	//
	socket.on("error", function(data) {
		console.log(data);
		if (data.code == "0") {
			$("#signup_dialog").dialog("close");
			$("#new_calendar_dialog").dialog("close");
			$("#change_password_dialog").dialog("close");
			$("#lost_password_dialog").dialog("close");
		}
		if (data.code == "2") { //signup
			$("#signup_dialog").dialog("close");
		} 
		//if (data.code == "3") {} //logout
		if (data.code == "5") { //new_category
			$("#new_calendar_dialog").dialog("close");
		}
		if (data.code == "10") { //edit_category
			$("#new_calendar_dialog").dialog("close");
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
		}
		if (data.code == "3") { //logout
			showLogged();
		}
		if (data.code == "4") { //login
			showLogged();
		}
		if (data.code == "5") { //new_category
			$("#new_calendar_dialog").dialog("close");
		}
		if (data.code == "10") { //edit_category
			$("#new_calendar_dialog").dialog("close");
		}
		if (data.code == "14") { //change_password
			$("#change_password_dialog").dialog("close");
		}
		if (data.code == "15") { //lost_password
            $("#lost_password_dialog").dialog("close");
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
		$("#signup_dialog").dialog("open");
	});
	
	$(".logout-button").click(function(event) {
		socket.emit("logout");
	});
	
	$(".submit-login").click( function(event) {
		socket.emit("login", $(".login-form").serialize());
console.log("Submitting login")
	});


	//right bar
	$("#new_category_dialog").dialog({ autoOpen: false }, { 
		buttons: [	
			{
				text: "Submit",
				click: function() {
					if(!is_edit_category) {
						socket.emit("new_category", $("#new_calendar_form").serialize());
					} else {
						socket.emit("edit_category", $("#new_calendar_form").serialize());
					}
				} 
			}, close_btn("Cancel")
		] 
	});

	
	showLogged();
} );
