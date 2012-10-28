<?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        session_start();
        if (isset($_SESSION['user_id'])) {
            session_destroy();
            
            $data = array("error"=>"null");
            echo json_encode($data);
            exit();
        }
    }
    
    $data = array("error"=>array("message"=>"Invalid request", "code"=>"3"));
    echo json_encode($data);
    exit();
    
?>

