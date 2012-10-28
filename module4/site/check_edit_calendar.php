<?php
    $user_logged = true; 
    include "start.php";

    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"10") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['name']) && isset($_POST['color']) && isset($_POST['cal_id'])) {
        $new_calendar = $_POST["name"];
        $color = $_POST["color"];
        $calendar_id = $_POST["cal_id"];
        $global = isset($_POST['global']);
	
        if(!is_color($color)) {
            $data = array("error"=>array("message"=>"Color in invalid format", "code"=>"10") );
            echo json_encode($data);
            exit();
        }
        if ($new_calendar == "" || $color == "") {
            $data = array("error"=>array("message"=>"Color and name are needed", "code"=>"10") );
            echo json_encode($data);
            exit();
        } 
	
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM calendars WHERE id=? and account_id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep Failed: ".htmlentities($mysqli->error), "code"=>"10") );
            echo json_encode($data);
            exit();
        }

        $stmt->bind_param('ss', $calendar_id, $user);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if (!$found) {
            $data = array("error"=>array("message"=>"Calendar doesn't exists", "code"=>"10") );
            echo json_encode($data);
            exit();
        }
		
        if($global && $admin) {
            $stmt = $mysqli->prepare("UPDATE calendars SET name=?, color=?, global=\"true\" WHERE id=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep global Failed: ".htmlentities($mysqli->error), "code"=>"10") );
                echo json_encode($data);
                exit();
            }
            $stmt->bind_param('sss', $new_calendar, $color, $calendar_id);
            $stmt->execute();
            $stmt->close();
        }
        
        $stmt = $mysqli->prepare("UPDATE calendars SET name=?, color=? WHERE id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"10") );
            echo json_encode($data);
            exit();
        }
        $stmt->bind_param('sss', $new_calendar, $color, $calendar_id);
        $stmt->execute();
        $stmt->close();
			
        $data = array("error"=>"null");
        echo json_encode($data);
        exit();
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"10") );
    echo json_encode($data);
    exit();	
?>
