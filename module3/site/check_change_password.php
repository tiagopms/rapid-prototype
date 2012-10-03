<?php
        session_start();
        include "functions.php";
	
        require 'database.php';
	
        if ($_POST['token'] != $_SESSION['token']) {
                $_SESSION['error'] = 'Invalid request.';
                header('Location: login.php');
                exit();
        }
	
        if (isset($_POST['old_password']) && isset($_POST['new_password'])) {
                $old_password = $_POST["old_password"];
		$new_password = $_POST["new_password"];
		
		if($new_password != $_POST["check_password"]) {
                        $_SESSION['error'] = 'New passwords don\'t match';
                        header('Location: change_password.php');
                        exit();
                }
		
		$id = $_SESSION["user_id"];
		
                if ($old_password == "" || $new_password== "") {
			$_SESSION['error'] = 'All fields are necessary.';
			header('Location: change_password.php');
			exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT crypt_pass FROM accounts WHERE id=?");
                        if(!$stmt){
                                printf("Query Prep Failed: %s\n", $mysqli->error);
                                exit;
                        }

                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $stmt->bind_result($crypt_pass);
                        $stmt->fetch();

			if(!crypt($old_password, $crypt_pass) == $crypt_pass) {
				$_SESSION['error'] = 'Wrong password';
				header('Location: change_password.php');
				exit();
			} else {
				$stmt->close();
			
				$stmt = $mysqli->prepare("UPDATE accounts SET crypt_pass=? WHERE id=?");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				$_SESSION['error'] = $id;
				
				$crypt_new_pass = crypt($new_password);
				
				$stmt->bind_param('ss', $crypt_new_pass, $id);
				$stmt->execute();
				$stmt->close();
				
				header('Location: home.php');
				exit();
			}
                }
        }

        header('Location: login.php');
        exit();	
?>
