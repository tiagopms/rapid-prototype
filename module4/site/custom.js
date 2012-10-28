var token = "";
var is_edit_calendar = false;
var is_edit_event = false;
var clicked_calendar;
var clicked_event;
var second_button;

function loadCalendar() {
	var current_date = $("#calendar").fullCalendar("getDate");
	
	var year = $.fullCalendar.formatDate(current_date, "yyyy");
	var month = $.fullCalendar.formatDate(current_date, "MM");
	
	$.get("calendar.php", {"year": year, "month": month}, function(data) {
		//right side bar calendars
		$(".aside-calendars").html("");
		$(".new_event_calendar").html("");
		for(count in data.calendars) {
			if(data.calendars[count].visible) {
				var current = " current";
			} else {
				var current = "";
			}
			if(!data.calendars[count].from_user) {
				var global = " global";
			} else {
				var global = "";
				$(".new_event_calendar").append("<option value=\"" + data.calendars[count].id + "\">" + data.calendars[count].name  + "</option>");
			}
			$(".aside-calendars").append("<li><a href=\"#\" class=\"calendar_item" + current + global + "\" id=\"calendar-" + data.calendars[count].id + "\">" + data.calendars[count].name  + "</a></li>");
			$("#calendar-" +  data.calendars[count].id).css("border-right", "30px solid #" + data.calendars[count].color);
		}
		
		$(".calendar_item:not(.global)").click(function(event) {
			var id = this.id.split("-")[1];
			$.post("uncheck_calendar.php", {"id": id, "token": token}, function(data) {
				if(data.error == "null") {
					showLogged();
				} else {
					errorMessage(data);
				}
			}, "json");
		});
		
		$(".calendar_item").bind("contextmenu", function(event) {
			return false;
		} );
		$(".calendar_item:not(.global)").mousedown(function (event) {
			second_button = true;
			clicked_calendar = this.id.split("-")[1];
			$(".edit_calendar_id").attr("value", this.id.split("-")[1])
			if(event.which == 3) {
				$("#calendar_second_button").css({top: event.pageY, left: event.pageX}).show();
			}
		} );
		
		//center main monthly calendar
		$("#calendar").fullCalendar("removeEvents");
                for(count in data.events) {
			var is_chore, complete, global;
			if (data.events[count].complete != undefined) {
				is_chore = " event-chore";
			} else {
				is_chore = "";
			}
			if(data.events[count].complete == "true") {
                                complete = " event-complete";
                        } else {
                                complete = "";
                        }
                        if(!data.events[count].from_user) {
                                global = " global";
				$("#calendar").fullCalendar("renderEvent", {
						"title": data.events[count].name,
						"start": data.events[count].date_and_time,
						"color": "#" + data.events[count].color,
						"textColor": "#" + invert_color(data.events[count].color),
						"id": data.events[count].id,
						"calendar": data.events[count].calendar_name,
						"calendar_id": data.events[count].calendar_id,
						"description": data.events[count].description,
						"is_chore": (data.events[count].complete != undefined),
						"complete": data.events[count].complete,
						"from_user": data.events[count].from_user,
						"className": "single_event event-" +  data.events[count].id + is_chore + complete + global,
				editable: false
				});
                        } else {
                                global = "";
				$("#calendar").fullCalendar("renderEvent", {
						"title": data.events[count].name,
						"start": data.events[count].date_and_time,
						"color": "#" + data.events[count].color,
						"textColor": "#" + invert_color(data.events[count].color),
						"id": data.events[count].id,
						"calendar": data.events[count].calendar_name,
						"calendar_id": data.events[count].calendar_id,
						"description": data.events[count].description,
						"is_chore": (data.events[count].complete != undefined),
						"complete": data.events[count].complete,
						"from_user": data.events[count].from_user,
						"className": "single_event event-" +  data.events[count].id + is_chore + complete + global,
				});
                        }
		}
		$(".single_event").bind("contextmenu", function(event) {
			return false;
		} );
		$(".single_event:not(.global)").mousedown(function (event) {
			second_button = true;
			var id;
			var classes = this.className.split(" ");
			for(count in classes) {
				var this_class = classes[count].split("-");
				if(this_class[0] == "event") {
					id = this_class[1];
					break;
				}
			}
			clicked_event = id;
			
			$(".edit_event_id").attr("value", clicked_event);
			if(event.which == 3) {
				$("#events_second_button").css({top: event.pageY, left: event.pageX}).show();
			}
		} );
	}, "json");
}

function errorMessage(data) {
	$("#error_dialog").text(data.error.message);
	$("#error_dialog").dialog("open");
}

function showLogged() {
	$.get("check_if_logged.php", function(data) {
		if(data.logged) {
			$(".logged").show();
			$(".unlogged").hide();
			
			$(".header-img").attr("src","http://en.gravatar.com/avatar/" + data.user_info.gravatar + "?s=70&amp;d=mm");
			$(".welcome").html("Hello, " + data.user_info.username + "!");
			
			if(data.user_info.admin) {
				$(".admin").show();
			} else {
				$(".admin").hide();
			}
			
			token = data.token;
			$(".token").attr("value",data.token);
		} else {
			$(".unlogged").show();
			$(".logged").hide();
		}
		loadCalendar();
	}, "json");
}

function format_time_number(number) {
	number = number + "";
	if(number.length==1) {
		return "0" + number;
	} else {
		return number;
	}
}

function format_color(colorval) {
	var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	delete(parts[0]);
	for (var i = 1; i <= 3; ++i) {
		parts[i] = parseInt(parts[i]).toString(16);
		if (parts[i].length == 1)
			parts[i] = '0' + parts[i];
	}
	color = parts.join('');
	return color.toUpperCase();
}

function invert_color(color) {
	var c1 = parseInt(color[0]+color[1], 16);
	var c2 = parseInt(color[2]+color[3], 16);
	var c3 = parseInt(color[4]+color[5], 16);
	if (c1 > 96 && c1 < 160 && c2 > 96 && c2 < 160 && c3 > 96 && c3 < 160) {
		return "FFFFFF";
	} else {
		return format_time_number((255 - c1).toString(16)) + format_time_number((255 - c2).toString(16)) + format_time_number((255 - c3).toString(16));
	}
}

$(document).ready(function() {
	//showLogged();
	$(document).click(function (event) {
		if(!second_button) {
			$(".second_button").hide();
		}
		second_button = false;
	} );
	
	$(".second_button").bind("contextmenu", function(event) {
		return false;
	} );
	
	$(".home-link").click(function(event) {
		showLogged();
	} );
	
	//dialogs	
	//signup dialog
	$("#signup_dialog").dialog({ autoOpen: false }, 
		{ buttons: [	
			{
				text: "Sign up",
				click: function() {
					$.post("check_signup.php", $("#signup_form").serialize(), function(data) {
						if(data.error == "null") {
							$("#signup_dialog").dialog("close");
							showLogged();
						} else {
							if(data.error.code != "2") {
								$("#signup_dialog").dialog("close");
							}
							errorMessage(data);
						}
					}, "json");
				} 
			}, {
                 		text: "Cancel",
                       		click: function() {
                                	$(this).dialog("close");
                        	}    
			}
		] }
	);
	//error dialog
	$("#error_dialog").dialog({ autoOpen: false },
		{ buttons: [
			{
				text: "Ok",
                                click: function() {
                                        $(this).dialog("close");
                                }
                        }
                ] }
        );
	//change password dialog
	$("#change_password_dialog").dialog({ autoOpen: false },
		{ buttons: [
			{
				text: "Submit",
                                click: function() {
					$.post("check_change_password.php", $("#change_password_form").serialize(), function(data) {
						if(data.error == "null") {
							$("#change_password_dialog").dialog("close");
							showLogged();
						} else {
							if(data.error.code != "14") {
								$("#change_password_dialog").dialog("close");
							}
							errorMessage(data);
						}
					}, "json");
                                }
                        }, {
                                text: "Cancel",
                                click: function() {
                                        $(this).dialog("close");
                                }
                        }
                ] }
        );
	$(".change_password_button").click(function(event) {
		$("#change_password_form")[0].reset();
		$("#change_password_dialog").dialog("open");
	} );
	//lost password dialog
	$("#lost_password_dialog").dialog({ autoOpen: false },
		{ buttons: [
			{
				text: "Submit",
                                click: function() {
					$.post("check_lost_password.php", $("#lost_password_form").serialize(), function(data) {
						if(data.error == "null") {
							$("#lost_password_dialog").dialog("close");
							showLogged();
						} else {
							if(data.error.code != "15") {
								$("#lost_password_dialog").dialog("close");
							}
							errorMessage(data);
						}
					}, "json");
                                }
                        }, {
                                text: "Cancel",
                                click: function() {
                                        $(this).dialog("close");
                                }
                        }
                ] }
        );
	$(".lost_password_button").click(function(event) {
		$("#lost_password_form")[0].reset();
		$("#lost_password_dialog").dialog("open");
	} );
	//new event dialog
	$("#new_event_dialog").dialog({ autoOpen: false },
                { buttons: [
                        {
                                text: "Submit",
                                click: function() {
					if(!is_edit_event) {
						$.post("check_add_new_event.php", $("#new_event_form").serialize(), function(data) {
							if(data.error == "null") {
								$("#new_event_dialog").dialog("close");
								showLogged();
							} else {
								if(data.error.code != "8") {
									$("#new_event_dialog").dialog("close");
								}
								errorMessage(data);
							}
						}, "json");
					} else {
						$.post("check_edit_event.php", $("#new_event_form").serialize(), function(data) {
							if(data.error == "null") {
								$("#new_event_dialog").dialog("close");
								showLogged();
							} else {
								if(data.error.code != "12") {
									$("#new_event_dialog").dialog("close");
								}
								errorMessage(data);
							}
						}, "json");
					}
                                }
                        }, {
                                text: "Cancel",
                                click: function() {
                                        $(this).dialog("close");
                                }
                        }
                ] }
        );
	$("#new_event_date").datepicker();
	for(var i=0; i<24;i++) {
		$(".new_event_time_hour").append("<option value=\"" +  format_time_number(i) + "\">" + format_time_number(i)  + "</option>");
	}
	for(var i=0; i<60;i++) {
		$(".new_event_time_min").append("<option value=\"" + format_time_number(i) + "\">" + format_time_number(i)  + "</option>");
	}
	//event info dialog
	$("#event_info_dialog").dialog({ autoOpen: false },
                { buttons: [
			{
                                text: "Ok",
                                click: function() {
                                        $(this).dialog("close");
                                }
                        }
                ] }
        );
	$(".event_info_complete").click( function(event) {
		if(this.checked != undefined) {
			var checked = this.checked;
			$.post("check_complete.php",  {"event_id": this.id, "complete": this.checked, "token": token}, function(data) {
				if(data.error == "null") {
					showLogged();
				} else {
					if(data.error.code != "9") {
						$("#new_event_dialog").dialog("close");
					}
					errorMessage(data);
					$(".event_info_complete").removeAttr("checked");
					if (!checked) {
						$(".event_info_complete").attr("checked", "checked");
					}
				}
			}, "json");
		}
        } );
	
	
	

	//headers
	$(".signup").click( function(event) {
		$("#signup_dialog").dialog("open");
	} );
	
	$(".logout-button").click( function(event) {
		$.post("check_logout.php", function(data) {
			if(data.error == "null") {
				showLogged();
			} else { 
                                errorMessage(data);
                        }
		}, "json");
	} );
	
	$(".submit-login").click( function(event) {
		$.post("check_login.php",  $(".login-form").serialize(), function(data) {
			if(data.error == "null") {
				showLogged();
			} else { 
                                errorMessage(data);
                        }
		}, "json");
	} );





	//right bar
	$("#new_calendar_dialog").dialog({ autoOpen: false }, 
		{ buttons: [	
			{
				text: "Submit",
				click: function() {
					if(!is_edit_calendar) {
						$.post("check_add_new_calendar.php", $("#new_calendar_form").serialize(), function(data) {
							if(data.error == "null") {
								$("#new_calendar_dialog").dialog("close");
								showLogged();
							} else {
								if(data.error.code != "5") {
									$("#new_calendar_dialog").dialog("close");
								}
								errorMessage(data);
							}
						}, "json");
					} else {
						$.post("check_edit_calendar.php", $("#new_calendar_form").serialize(), function(data) {
							if(data.error == "null") {
								$("#new_calendar_dialog").dialog("close");
								showLogged();
							} else {
								if(data.error.code != "11") {
									$("#new_calendar_dialog").dialog("close");
								}
								errorMessage(data);
							}
						}, "json");
					}
				} 
			}, {
                 		text: "Cancel",
                       		click: function() {
                                	$(this).dialog("close");
                        	}    
			}
		] }
	);
	$(".edit_calendar").click( function(event) {
		$("#name_new_calendar").val($("#calendar-" + clicked_calendar).text());
		$("#color").css("background-color", "#" + format_color($("#calendar-" + clicked_calendar).css("border-right-color")));
		$("#color").val(format_color($("#calendar-" + clicked_calendar).css("border-right-color")));
		if($("#calendar-" + clicked_calendar).hasClass("global")) {
			$("#global").attr("checked", "checked");
		}
		
		is_edit_calendar = true;
		$("#new_calendar_dialog").dialog("open");
	} );
	$(".delete_calendar").click( function(event) {
		$.post("check_remove_calendar.php", {"cal_id": clicked_calendar, "token": token}, function(data) {
			if(data.error == "null") {
				showLogged();
			} else {
				errorMessage(data);
			}
		}, "json");
	} );
	$(".new_calendar").click( function(event) {
		$("#new_calendar_form")[0].reset();
		is_edit_calendar = false;
		$("#new_calendar_dialog").dialog("open");
	} );
	$(".new_event").click( function(event) {
		$("#new_event_form")[0].reset();
		$("#chore").removeAttr("checked");
		is_edit_event = false;
		$("#new_event_dialog").dialog("open");
	} );
	$(".edit_events").click( function(event) {
		var events = $("#calendar").fullCalendar("clientEvents");
		var this_event;
		for(var count in events) {
			if ($("#calendar").fullCalendar("clientEvents")[count].id == clicked_event) { 
				console.log($("#calendar").fullCalendar("clientEvents")[count].id);
				this_event = $("#calendar").fullCalendar("clientEvents")[count];
				console.log(this_event);
			}
		}
				console.log(clicked_event);

		$("#name_new_event").val(this_event.title);
		$("#new_event_date").val($.fullCalendar.formatDate(this_event.start, "MM/dd/yyyy"));
		$(".new_event_time_hour").val($.fullCalendar.formatDate(this_event.start, "HH"));
		$(".new_event_time_min").val($.fullCalendar.formatDate(this_event.start, "mm"));

		$(".new_event_calendar").val(this_event.calendar_id);
		$("#new_event_description").val(this_event.description);
		$("#chore").removeAttr("checked");
		if(this_event.is_chore) {
			$("#chore").attr("checked", "checked");
		}

		is_edit_event = true;
		$("#new_event_dialog").dialog("open");
	} );
	$(".delete_events").click( function(event) {
		$.post("check_remove_event.php", {"event_id": clicked_event, "token": token}, function(data) {
			if(data.error == "null") {
				showLogged();
			} else {
				errorMessage(data);
			}
		}, "json");
	} );
	
	$("#admin_dialog").dialog({ autoOpen: false },
                { buttons: [
                        {
                                text: "Ok",
                                click: function() {
					$.post("check_add_admin.php", $("#admin_form").serialize(), function(data) {
						if(data.error == "null") {
							$("#admin_dialog").dialog("close");
							showLogged();
						} else {
							if(data.error.code != "5") {
								$("#admin_dialog").dialog("close");
							}
							errorMessage(data);
						}
					}, "json");
                                }
                        }, {
                                text: "Cancel",
                                click: function() {
					$("#admin_dialog").dialog("close");
				}
			}
                ] }
        );
	$(".admin_button").click( function(event) {
                $.post("get_users.php", function(data) {
                        if(data.error == undefined) {
				for(count in data.users) {
					$("#user_admin").append("<option value=\"" + data.users[count].id + "\">" + data.users[count].name  + "</option>");
				}
				$("#admin_dialog").dialog("open");
                        } else {
                                errorMessage(data);
                        }
                }, "json");
        } );

	
	//calendar
	$("#calendar").fullCalendar({
		dayClick: function(date, allDay, jsEvent, view) {
			$("#new_event_date").attr("value", $.fullCalendar.formatDate(date, "MM/dd/yyyy"));
			$("#new_event_dialog").dialog("open");
		},
		eventClick: function (event) {
			$("#name_event_info").text(event.title);
			$("#event_info_date").text($.fullCalendar.formatDate(event.start, "ddd, ddS of MMMM"));
			$(".event_info_calendar").text(event.calendar);
			$("#event_info_description").text(event.description);
			if(event.is_chore && event.from_user) {
				$(".event_info_complete_global").hide();
				$(".event_info_complete").removeAttr("checked");
				if (event.complete == "true") {
					$(".event_info_complete").attr("checked", "checked");
				}
				$(".event_info_complete").attr("id", "complete-" + event.id);
				$(".event_info_complete").show();
			} else if (event.is_chore) {
				$(".event_info_complete").hide();
				if (event.complete == "true") {
					$("#event_info_complete_global").text("Yes");
				} else {
					$("#event_info_complete_global").text("No");
				}
				$(".event_info_complete_global").show();
			} else {
				$(".event_info_complete_global").hide();
				$(".event_info_complete").hide();
			}
			
			$("#event_info_dialog").dialog("open");
		},
		events: function(start, end, callback) { 
			showLogged();
		},
		eventDrop: function(event,dayDelta,minuteDelta,allDay,revertFunc) {
			$("#name_new_event").val(event.title);
			$("#new_event_date").val($.fullCalendar.formatDate(event.start, "MM/dd/yyyy"));
			$(".new_event_time_hour").val($.fullCalendar.formatDate(event.start, "HH"));
			$(".new_event_time_min").val($.fullCalendar.formatDate(event.start, "mm"));
			$(".edit_event_id").attr("value", event.id);

			$(".new_event_calendar").val(event.calendar_id);
			$("#new_event_description").val(event.description);
			$("#chore").removeAttr("checked");
			if(event.is_chore) {
				$("#chore").attr("checked", "checked");
			}

			$.post("check_edit_event.php", $("#new_event_form").serialize(), function(data) {
				if(data.error == "null") {
					showLogged();
				} else {
					errorMessage(data);
				}
			}, "json");
		},
		editable: true,
		disableResizing: true
	});
} );
