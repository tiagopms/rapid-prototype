<?php
    $user_logged = true; 
    include "start.php";

    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"9") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['complete']) && isset($_POST['event_id'])) {
        $complete = $_POST["complete"];
        $event_id = explode("-", $_POST["event_id"]);
        $event_id = $event_id[1];
	
	
	
        if ($event_id == "") {
            $data = array("error"=>array("message"=>"Event invalid", "code"=>"9") );
            echo json_encode($data);
            exit();
        } 
		
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM events JOIN calendars ON (calendar_id=calendars.id) WHERE calendars.account_id=? and events.id=? and complete IS NOT NULL");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep Failed: ".htmlentities($mysqli->error), "code"=>"9") );
            echo json_encode($data);
            exit();
        }

        $stmt->bind_param('ss', $user, $event_id);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if (!$found) {
            $data = array("error"=>array("message"=>"Chore doesn't exists", "code"=>"8") );
            echo json_encode($data);
            exit();
        }
	
        $stmt = $mysqli->prepare("UPDATE events SET complete=? WHERE id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"9") );
            echo json_encode($data);
            exit();
        }
        $stmt->bind_param('ss', $complete, $event_id);
        $stmt->execute();
        $stmt->close();
			
        $data = array("error"=>"null");
        echo json_encode($data);
        exit();
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"9") );
    echo json_encode($data);
    exit();	
?>
