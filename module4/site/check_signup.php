<?php
    $redirect = "home.php";
    $user_logged = false; 
    include "start.php";

    if (isset($_POST['username']) && isset($_POST['password']) && isset($_POST['check_password']) && isset($_POST['email'])) {
        $login = $_POST["username"];
        $password = $_POST["password"];

        if($password != $_POST["check_password"]) {
            $data = array("error"=>array("message"=>"Passwords don't match", "code"=>"2") );
            echo json_encode($data);
            exit();
        }
        
        $email = $_POST["email"];
        
        if ($login == "" || $password == "" || $email == "") {
            $data = array("error"=>array("message"=>"All fields are necessary.", "code"=>"2") );
            echo json_encode($data);
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE username=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep 1 Failed:".htmlentities($mysqli->error) , "code"=>"2") );
                echo json_encode($data);
                exit;
            }
            
            $stmt->bind_param('s', $login);
            $stmt->execute();
            $stmt->bind_result($found);
            $stmt->fetch();

            if ($found) {
                $data = array("error"=>array("message"=>"Username already exists", "code"=>"2") );
                echo json_encode($data);
                exit();
            } else {
                $stmt->close();
                
                $stmt = $mysqli->prepare("INSERT INTO accounts (username, crypt_pass, email_address) VALUES (?, ?, ?)");
                if(!$stmt){
                    $data = array("error"=>array("message"=>"Query Prep 2 Failed:".htmlentities($mysqli->error) , "code"=>"2") );
                    echo json_encode($data);
                    exit;
                }
                
                $crypt_pass = crypt($password);
                
                $stmt->bind_param('sss', $login, $crypt_pass, $email);
                $stmt->execute();
                $stmt->close();
                
                $stmt = $mysqli->prepare("SELECT id FROM accounts WHERE username=?");
                if(!$stmt){
                    $data = array("error"=>array("message"=>"Query Prep 3 Failed:".htmlentities($mysqli->error) , "code"=>"2") );
                    echo json_encode($data);
                    exit;
                }
                
                $stmt->bind_param('s', $login);
                $stmt->execute();
                $stmt->bind_result($id);
                $stmt->fetch();
                $stmt->close();
                
                $stmt = $mysqli->prepare("INSERT INTO calendars (account_id, name, color) VALUES (?, ?, \"000000\")");
                if(!$stmt){
                    $data = array("error"=>array("message"=>"Query Prep 4 Failed:".htmlentities($mysqli->error) , "code"=>"2") );
                    echo json_encode($data);
                    exit;
                }
                
                $stmt->bind_param('ss', $id, $login);
                $stmt->execute();
                $stmt->close();
		
                $_SESSION['user_id'] = $id;
                $_SESSION['token'] = random_token();
                
                $data = array("signup"=>"success", "error"=>"null");
                echo json_encode($data);
                exit();
            }
        }
    }

    $data = array("error"=>array("message"=>"Invalid request", "code"=>"2") );
    echo json_encode($data);
    exit(); 
?>
