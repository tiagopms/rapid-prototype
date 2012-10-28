<?php
    $user_logged = true; 
    include "start.php";

    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"12") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['name']) && isset($_POST['description']) &&  isset($_POST['calendar_id']) && isset($_POST['date']) && isset($_POST['time_hour']) && isset($_POST['time_min']) && isset($_POST['event_id'])) {
        $new_event = $_POST["name"];
        $event_id = $_POST["event_id"];
        $description = $_POST["description"];
        $calendar_id = $_POST["calendar_id"];
        $date = $_POST["date"];
        $time_hour = $_POST["time_hour"];
        $time_min = $_POST["time_min"];
	
        if(!($date = is_date($date, $time_hour, $time_min))) {
            $data = array("error"=>array("message"=>"Date in invalid format", "code"=>"12") );
            echo json_encode($data);
            exit();
        }
        if ($new_event == "" || $calendar_id == "" || $event_id == "") {
            $data = array("error"=>array("message"=>"Name and calendar are needed", "code"=>"12") );
            echo json_encode($data);
            exit();
        } 
		
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM calendars WHERE id=? and account_id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep Failed: ".htmlentities($mysqli->error), "code"=>"12") );
            echo json_encode($data);
            exit();
        }

        $stmt->bind_param('ss', $calendar_id, $user);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if (!$found) {
            $data = array("error"=>array("message"=>"Calendar doesn't exists", "code"=>"12") );
            echo json_encode($data);
            exit();
        }
	
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM events JOIN calendars ON (calendar_id=calendars.id) WHERE events.id=? and account_id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"12") );
            echo json_encode($data);
            exit();
        }

        $stmt->bind_param('ss', $event_id, $user);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if (!$found) {
            $data = array("error"=>array("message"=>"Event doesn't exists", "code"=>"12") );
            echo json_encode($data);
            exit();
        }
	
        if(isset($_POST['chore'])) {
            $stmt = $mysqli->prepare("UPDATE events SET calendar_id=?, name=?, description=?, date_and_time=?, complete=\"false\" WHERE id=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep 3 Failed: ".htmlentities($mysqli->error), "code"=>"12") );
                echo json_encode($data);
                exit();
            }
            $stmt->bind_param('sssss', $calendar_id, $new_event, $description, $date, $event_id);
            $stmt->execute();
            $stmt->close();
			
            $data = array("error"=>"null");
            echo json_encode($data);
            exit();
		
        }
		
        $stmt = $mysqli->prepare("UPDATE events SET calendar_id=?, name=?, description=?, date_and_time=?, complete=NULL WHERE id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 4 Failed: ".htmlentities($mysqli->error), "code"=>"12") );
            echo json_encode($data);
            exit();
        }
        $stmt->bind_param('sssss', $calendar_id, $new_event, $description, $date, $event_id);
        $stmt->execute();
        $stmt->close();
			
        $data = array("error"=>"null");
        echo json_encode($data);
        exit();
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"12") );
    echo json_encode($data);
    exit();	
?>
