<?php
    $user_logged = false; 
    include "start.php";
    
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $login = $_POST["username"];
        $password = $_POST["password"];
        
        if ($login == "" || $password == "") {
            if ($login == "") {
                $data = array("error"=>array("message"=>"Empty username", "code"=>"4") );
                echo json_encode($data);
                exit();
            } else if ($password == "") {
                $data = array("error"=>array("message"=>"Empty password", "code"=>"4") );
                echo json_encode($data);
                exit();
            }
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*), id, crypt_pass FROM accounts WHERE username=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep Failed".htmlentities($mysqli->error), "code"=>"4") );
                echo json_encode($data);
                exit;
            }
            
            $stmt->bind_param('s', $login);
            $stmt->execute();
            $stmt->bind_result($found, $existing_id, $crypt_pass);
            $stmt->fetch();
                        
            if (!$found) {
                $data = array("error"=>array("message"=>"Username not found", "code"=>"4") );
                echo json_encode($data);
                exit();
            } else {
                if(crypt($password, $crypt_pass) == $crypt_pass) {
                    $_SESSION['user_id'] = $existing_id;
                    $_SESSION['token'] = random_token();
                    $data = array("error"=>"null");
                    echo json_encode($data);
                    exit();
                } else {
                    $data = array("error"=>array("message"=>"Wrong password", "code"=>"4") );
                    echo json_encode($data);
                    exit();
                }
            }
        }
    }
     
    $data = array("error"=>array("message"=>"Invalid operation", "code"=>"4") );
    echo json_encode($data);
    exit();
?>
