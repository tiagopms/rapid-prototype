<?php
    $user_logged = false; 
    include "start.php";

    if (isset($_POST['username']) && isset($_POST['email'])) {
        $login = $_POST["username"];
        $email = $_POST["email"];
    
        if ($login == "" || $email == "") {
            $data = array("error"=>array("message"=>"All fields are necessary", "code"=>"15") );
            echo json_encode($data);
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE username=? and email_address=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep 1 Failed: ".htmlentities($mysqli->error), "code"=>"15") );
                echo json_encode($data);
                exit();
            }

            $stmt->bind_param('ss', $login, $email);
            $stmt->execute();
            $stmt->bind_result($found);
            $stmt->fetch();

            if (!$found) {
                $data = array("error"=>array("message"=>"Username and email doesn't match", "code"=>"15") );
                echo json_encode($data);
                exit();
            } else {
                $stmt->close();
                
                $new_pass = substr(random_token(), 0, 10);
                $crypt_new_pass = crypt($new_pass);
                
                $stmt = $mysqli->prepare("UPDATE accounts SET crypt_pass=? WHERE username=? and email_address=?");
                if(!$stmt){
                    $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"15") );
                    echo json_encode($data);
                    exit();
                }
            
                $stmt->bind_param('sss', $crypt_new_pass, $login, $email);
                $stmt->execute();
                $stmt->close();
                
                $subject = "New Password from SimpleNews!";
                $body = "Hi,\n\nYour new password is: ".htmlentities($new_pass)."\n\nHave a nice day!\n";
                if (mail($email, $subject, $body)) {
                    $data = array("error"=>"null" );
                    echo json_encode($data);
                } else {
                    $data = array("error"=>array("message"=>"Message sent failed", "code"=>"15") );
                    echo json_encode($data);
                }
                
                exit();
            }
        }
    }

    $data = array("error"=>array("message"=>"Invalid request", "code"=>"15") );
    echo json_encode($data);
    exit(); 
?>
