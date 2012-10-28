<?php
    include "start.php";
   
    if($user_logged) {
        $id = $user;
    } else {
        $id = -1;
    }
    
    $stmt = $mysqli->prepare("
	SELECT id, username
	FROM accounts
	WHERE not id=? AND admin=\"false\"
    ");
    if(!$stmt){
        $data = array("error"=>array("message"=>"Querry prep failed: ".htmlentities($mysqli->error), "code"=>"18"));
        echo json_encode($data);
        exit;
    }
    
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $stmt->bind_result($other_id, $other_username);
    
    $data = array("users"=>array());
    while($stmt->fetch()) {
        $data["users"][count($data["users"])] =  array("id"=>htmlentities($other_id), "name"=>htmlentities($other_username));
    }
    $stmt->close();
    
    echo json_encode($data);
    exit();
?>
