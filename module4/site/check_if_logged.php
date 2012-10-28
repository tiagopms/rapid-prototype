<?php
    include "start.php";
   
    if($user_logged) {
        $data = array("logged" => isset($_SESSION['user_id']), "user_info"=>array("username"=>htmlentities($name), "email"=>htmlentities($email), "admin"=>htmlentities($admin), "gravatar"=> htmlentities(md5($email))), "token"=>htmlentities($_SESSION['token']));
    } else {
        $data = array("logged" => isset($_SESSION['user_id']));
    }
    echo json_encode($data);
    exit();
?>
