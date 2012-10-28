<?php
    $user_logged = true; 
    include "start.php";

      
    if (!isset($_POST['token']) || $_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"14") );
        echo json_encode($data);
        exit();
    }

    if (isset($_POST['old_password']) && isset($_POST['new_password'])) {
        $old_password = $_POST["old_password"];
        $new_password = $_POST["new_password"];
        
        if($new_password != $_POST["check_password"]) {
            
            $data = array("error"=>array("message"=>'New passwords don\'t match', "code"=>"14"));
            echo json_encode($data);
            exit();
        }
        
        if ($old_password == "" || $new_password == "") {
            $data = array("error"=>array("message"=>'All fields are necessary.', "code"=>"14"));
            echo json_encode($data);
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT crypt_pass FROM accounts WHERE id=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>sprintf("Query Prep Failed: %s\n", htmlentities($mysqli->error)), "code"=>"14"));
		echo json_encode($data);
                exit();
            }

            $stmt->bind_param('s', $user);
            $stmt->execute();
            $stmt->bind_result($crypt_pass);
            $stmt->fetch();

            if(crypt($old_password, $crypt_pass) != $crypt_pass) {
                $data = array("error"=>array("message"=>"Wrong password", "code"=>"14"));
		echo json_encode($data);
                exit();
            } else {
                $stmt->close();
            
                $stmt = $mysqli->prepare("UPDATE accounts SET crypt_pass=? WHERE id=?");
                if(!$stmt){
                    $data = array("error"=>array("message"=>sprintf("Query Prep 2 Failed: %s\n", htmlentities($mysqli->error)), "code"=>"14"));
                    echo json_encode($data);
                    exit();
                }
                
                $crypt_new_pass = crypt($new_password);
                
                $stmt->bind_param('ss', $crypt_new_pass, $user);
                $stmt->execute();
                $stmt->close();
                
                $data = array("error"=>"null");
                echo json_encode($data);
                exit();
            }
        }
    }

    $data = array("error"=>array("message"=>"Invalid attempt",  "code"=>"14") );
    echo json_encode($data);
    exit();	
?>
