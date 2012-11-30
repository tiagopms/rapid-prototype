
window.myobj = {
    markerOver: function() { this.openInfoWindow(); },
    markerOut: function() { this.closeInfoWindow(); }
};
$(document).ready(function() {
    function resize() {
        var size = ($(window).height() - 199);
        if (size < 350) {
            size = 350;
        }
        $('section').css('min-height', size + "px");
        $('.gmap').css('height', size - 65 + "px");
        $('.gmap > div').css('height', size - 65 + "px");
    };

        
    $(window).resize(resize);
    resize();
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    function open_add_tag_funct() {
        $.get("/tags/add_tag/", function(data) {
            $("#add_tag_dialog").html(data);
            $("#add_tag_dialog").dialog("open");
        } );
    }
    $("#add_tag_dialog").dialog({ autoOpen: false, title: "Add Tag" }, 
        { buttons: [
            {
                text: "Add",
                click: function() {
                    $.post("/tags/add_tag/", $("#add_tag_form").serialize(), function(data) {
                        if(data == "Success") {
                            $("#add_tag_dialog").dialog("close");
                            $.get("/images/add_image/", function(data) {
                                $("#add_image_tags").html(data);
                                $('#add_image_tags #id_tag option:last-child').attr("selected", "selected");
                                $(".open_add_tag").click( open_add_tag_funct );
                            } );
                        } else {
                            $("#add_tag_dialog").html(data);
                        }
                    });
                }
            }, {
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }
        ] }
    );
    $(".open_add_tag").click( open_add_tag_funct );

    function open_add_location_funct() {
        $.get("/tags/add_location/", function(data) {
            $("#add_location_dialog").html(data);
            $("#add_location_dialog").dialog("open");

            //Google!
            $("#google_search_text_field").keydown(function(evt) {
                if (evt.keyCode == '9') {
                    $(".location-autocomplete").hide();
                }
            } );
            $("#google_search_text_field").keyup(function(evt) {
                if (evt.keyCode == '13') {
                    add_location_funct();
                }
                var input = $('#google_search_text_field #id_name');
                
                if(input.val() != "") {
                    var service = new google.maps.places.AutocompleteService();
                    service.getQueryPredictions({input: input.val()}, function autoComplete(predictions, status){
                        $(".location-autocomplete").html("");
                        if(predictions != null) {
                            for (var i = 0, prediction; prediction = predictions[i]; i++) {
                                $(".location-autocomplete").html($(".location-autocomplete").html() + "<div class=\"google-item\">" + prediction.description + "</div>");
                            }
                        }
                        $(".location-autocomplete").show();

                        console.log($('#google_search_text_field #id_name').offset());
                        var pos = $('#google_search_text_field #id_name').offset();
                        pos.top = pos.top+29;
                        $(".location-autocomplete").offset(pos);

                        $(".google-item").click(function () {
                            $('#google_search_text_field #id_name').val($(this).text());
                            //$("#google_search_text_field").keyup();
                            $(".location-autocomplete").hide();
                            $("#id_name")[0].focus();
                        } );
                        $(document).mouseup(function (e) {
                            var container = $("#google_search_text_field #id_name, .location-autocomplete");

                            if (!container.is(e.target) && container.has(e.target).length === 0) {
                                $(".location-autocomplete").hide();
                                $(document).off("mouseup");
                            }
                        });
                        $("#google_search_text_field").blur(function(evt) {
                            $(".location-autocomplete").hide();
                        } );
                    } );
                } else {
                    $(".location-autocomplete").html("");
                }
            } );
        } );
    }
    function add_location_funct() {
        var geo = new google.maps.Geocoder;
        var address = $("#google_search_text_field #id_name").val();
        geo.geocode({'address': address},function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {              
                var myLatLng = results[0].geometry.location;
                
                $("#add_location_form #id_lat").val(myLatLng.lat().toFixed(7));
                $("#add_location_form #id_lng").val(myLatLng.lng().toFixed(7));
            } else {
                $("#add_location_form #id_lat").val("");
                $("#add_location_form #id_lng").val("");
            }
            $.post("/tags/add_location/", $("#add_location_form").serialize(), function(data) {
                if(data == "Success") {
                    $("#add_location_dialog").dialog("close");
                    $.get("/images/add_image/", {"locations": true}, function(data) {
                        $("#add_image_locations").html(data);
                        $(".open_add_location").click( open_add_location_funct );
                        $('#add_image_locations #id_location option:last-child').attr("selected", "selected");
                    } );
                } else {
                    $("#add_location_dialog").html(data);
                }
            } );
        } );
    }
    $("#add_location_dialog").dialog({ autoOpen: false, title: 'Add Location' }, 
        { buttons: [
            {
                text: "Add",
                click: add_location_funct
            }, {
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }
        ] }
    );
    $(".open_add_location").click( open_add_location_funct );

    $("#id_search").keyup(function(evt) {
        $.get("/search/", $("#search_form").serialize(), function(data) {
            $(".list_tags").html(data);
        });

    });

    if (!$('#tag_canvas').tagcanvas({
        textColour: '#FFBF40',
        outlineColour: '#f40',
        outlineMethod: 'colour',
        reverse: true,
        depth: 0.8,
        maxSpeed: 0.05
    }, 'tags')) {
        $('#tag_canvas_container').hide();
    }


} );
