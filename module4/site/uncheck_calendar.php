<?php
    include "start.php";
    
    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"7") );
        echo json_encode($data);
        exit();
    }
    
    if (!isset($_POST['id'])) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"7") );
        echo json_encode($data);
        exit();
    }
    
    $calendar_id = $_POST['id'];
    
    if ($calendar_id == "") {
        $data = array("error"=>array("message"=>"Invalid empty calendar id", "code"=>"7") );
        echo json_encode($data);
        exit();
    }
    
    if($user_logged) {
        $id = $user;
    } else {
        $id = -1;
    }
    
    $stmt = $mysqli->prepare("UPDATE calendars SET visible= IF(visible=\"true\", \"false\", \"true\") WHERE account_id=? and id=?");
    if(!$stmt){
        $data = array("error"=>array("message"=>"Querry prep failed: ".htmlentities($mysqli->error), "code"=>"7"));
        echo json_encode($data);
        exit;
    }
    
    $stmt->bind_param('ss', $id, $calendar_id);
    $stmt->execute();
    $stmt->close();
    
    $data = array("error"=>"null");
    echo json_encode($data);
    exit();
?>
