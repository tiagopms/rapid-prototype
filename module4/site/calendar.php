<?php
    include "start.php";
   
    if($user_logged) {
        $id = $user;
    } else {
        $id = -1;
    }
    
    $stmt = $mysqli->prepare("
	SELECT id, name, color, visible, account_id 
	FROM calendars 
	WHERE account_id=? or (global=\"true\" and visible=\"true\")
	ORDER BY global DESC
    ");
    if(!$stmt){
        $data = array("error"=>array("message"=>"Querry prep failed: ".htmlentities($mysqli->error), "code"=>"6"));
        echo json_encode($data);
        exit;
    }
    
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $stmt->bind_result($calendar_id, $calendar_name, $calendar_color, $visible, $calendar_account_id);
    
    $data = array("calendars"=>array());
    while($stmt->fetch()) {
        $data["calendars"][count($data["calendars"])] =  array("id"=>htmlentities($calendar_id), "name"=>htmlentities($calendar_name), "color"=>htmlentities($calendar_color), "visible"=>($visible=="true"), "from_user"=>($calendar_account_id==$id));
    }
    $stmt->close();
    
    $stmt = $mysqli->prepare("
                SELECT events.id, events.name, events.description, events.date_and_time, events.complete, calendars.id, calendars.name, calendars.color, calendars.account_id
                FROM events
                    JOIN calendars ON (calendar_id=calendars.id)
                WHERE (calendars.account_id=? or calendars.global=\"true\") and calendars.visible=\"true\" and events.date_and_time>=? and events.date_and_time<?
    ");
    if(!$stmt){
        $data = array("error"=>array("message"=>"Querry prep 2 failed: ".htmlentities($mysqli->error), "code"=>"6"));
        echo json_encode($data);
        exit;
    }
    
    if(!isset($_GET["year"]) || !isset($_GET["month"])) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"6"));
        echo json_encode($data);
        exit();
    }
    $year = $_GET["year"];
    $month = $_GET["month"];
    
    $before = $year."-".$month."-01";
    $after = $year."-".($month+1)."-01";
    
    $stmt->bind_param('sss', $id, $before, $after);
    $stmt->execute();
    $stmt->bind_result($event_id, $event_name, $event_description, $event_date_and_time, $event_complete, $calendar_id, $calendar_name, $calendar_color, $calendar_account_id);

    $data["events"] = array();
    while($stmt->fetch()) {
        $data["events"][count($data["events"])] =  array("id"=>htmlentities($event_id), "name"=>$event_name, "description"=>htmlentities($event_description), "date_and_time"=>htmlentities($event_date_and_time), "complete"=>$event_complete, "calendar_id"=>htmlentities($calendar_id), "calendar_name"=>htmlentities($calendar_name), "color"=>htmlentities($calendar_color), "from_user"=>($calendar_account_id==$id));
    }
    $stmt->close(); 
    
    echo json_encode($data);
    exit();
?>
