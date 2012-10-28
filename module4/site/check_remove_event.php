<?php
    $user_logged = true; 
    include "start.php";

    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"13") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['event_id'])) {
        $event_id = $_POST["event_id"];

        if ($event_id == "") {
            $data = array("error"=>array("message"=>"Invalid event", "code"=>"13") );
            echo json_encode($data);
            exit();
        } 
		
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM events JOIN calendars ON (calendar_id=calendars.id) WHERE events.id=? and account_id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep Failed: ".htmlentities($mysqli->error), "code"=>"13") );
            echo json_encode($data);
            exit();
        }

        $stmt->bind_param('ss', $event_id, $user);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if (!$found) {
            $data = array("error"=>array("message"=>"Event doesn't exists", "code"=>"13") );
            echo json_encode($data);
            exit();
        }
	
        $stmt = $mysqli->prepare("DELETE FROM events WHERE id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"13") );
            echo json_encode($data);
            exit();
        }
        $stmt->bind_param('s', $event_id);
        $stmt->execute();
        $stmt->close();
			
        $data = array("error"=>"null");
        echo json_encode($data);
        exit();
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"13") );
    echo json_encode($data);
    exit();	
?>
