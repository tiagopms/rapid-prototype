<?php
    $user_logged = true; 
    include "start.php";

    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"11") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['cal_id'])) {
        $calendar_id = $_POST["cal_id"];
	
        if ($calendar_id == "") {
            $data = array("error"=>array("message"=>"No calendar selected", "code"=>"11") );
            echo json_encode($data);
            exit();
        } 
	
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM calendars WHERE id=? and account_id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep Failed: ".htmlentities($mysqli->error), "code"=>"11") );
            echo json_encode($data);
            exit();
        }

        $stmt->bind_param('ss', $calendar_id, $user);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if (!$found) {
            $data = array("error"=>array("message"=>"Calendar doesn't exists", "code"=>"11") );
            echo json_encode($data);
            exit();
        }
		
        $stmt = $mysqli->prepare("DELETE FROM calendars WHERE id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"11") );
            echo json_encode($data);
            exit();
        }
        $stmt->bind_param('s', $calendar_id);
        $stmt->execute();
        $stmt->close();
			
        $data = array("error"=>"null");
        echo json_encode($data);
        exit();
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"11") );
    echo json_encode($data);
    exit();	
?>
