<?php
    session_start();
    header('Content-Type: text/html; charset=utf-8'); 
    date_default_timezone_set('America/Chicago');
    if (isset($user_logged) && (isset($_SESSION['user_id']) xor $user_logged)) {
        if($user_logged) {
            $data = array("error"=>array("message"=>"User not logged in, invalid request", "code"=>"0") );
        } else {
            $data = array("error"=>array("message"=>"User already logged in, invalid request", "code"=>"1") );
        }
        echo json_encode($data);
        
        exit();
    }
    
    require 'database.php';
    include "functions.php";
    if (!isset($user_logged)) {
        $user_logged = isset($_SESSION['user_id']);
    }
    if ($user_logged) {
    	$user = $_SESSION['user_id'];
        $stmt = $mysqli->prepare("SELECT username, email_address, admin FROM accounts WHERE id=?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->bind_param('s', $user);
        $stmt->execute();
        $stmt->bind_result($name, $email, $admin);
        $stmt->fetch();
        $stmt->close();
        $admin = ($admin == "true");
    }
    
    
?>
