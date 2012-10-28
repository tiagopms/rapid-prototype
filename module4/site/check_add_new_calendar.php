<?php
    $user_logged = true; 
    include "start.php";

    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"5") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['name']) && isset($_POST['color'])) {
        $new_calendar = $_POST["name"];
        $color = $_POST["color"];
        $global = isset($_POST['global']);
	
	if(!is_color($color)) {
            $data = array("error"=>array("message"=>"Color in invalid format", "code"=>"5") );
            echo json_encode($data);
            exit();
	}
        if ($new_calendar == "" || $color == "") {
            $data = array("error"=>array("message"=>"Color and name are needed", "code"=>"5") );
            echo json_encode($data);
            exit();
        } 
		
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM calendars WHERE name=? and account_id=?");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep Failed: ".htmlentities($mysqli->error), "code"=>"5") );
            echo json_encode($data);
			exit();
        }

        $stmt->bind_param('ss', $new_calendar, $user);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if ($found) {
            $data = array("error"=>array("message"=>"Calendar name already exists", "code"=>"5") );
            echo json_encode($data);
			exit();
        }
		
        if($global && $admin) {
            $stmt = $mysqli->prepare("INSERT INTO calendars (account_id, name, color, global) VALUES (?, ?, ?, \"true\")");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep global Failed: ".htmlentities($mysqli->error), "code"=>"5") );
                echo json_encode($data);
                exit();
            }
            $stmt->bind_param('sss', $user, $new_calendar, $color);
            $stmt->execute();
    		$stmt->close();
        }
        
        $stmt = $mysqli->prepare("INSERT INTO calendars (account_id, name, color) VALUES (?, ?, ?)");
        if(!$stmt){
            $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"5") );
            echo json_encode($data);
            exit();
        }
        $stmt->bind_param('sss', $user, $new_calendar, $color);
        $stmt->execute();
        $stmt->close();
			
        $data = array("error"=>"null");
        echo json_encode($data);
        exit();
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"5") );
    echo json_encode($data);
    exit();	
?>
