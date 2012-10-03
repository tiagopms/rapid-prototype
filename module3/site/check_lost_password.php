<?php
        session_start();
        include "functions.php";
	
        require 'database.php';
	
        if (isset($_POST['username']) && isset($_POST['email'])) {
                $login = $_POST["username"];
		$email = $_POST["email"];
		
                if ($login == "" || $email == "") {
			$_SESSION['error'] = 'All fields are necessary.';
			header('Location: lost_password.php');
			exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE username=? and email_address=?");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('ss', $login, $email);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();

                        if (!$found) {
                                $_SESSION['error'] = 'Username and email doesn\'t match';
                                header('Location: lost_password.php');
                                exit();
                        } else {
				$stmt->close();
				
				$new_pass = substr(random_token(), 0, 10);
				$crypt_new_pass = crypt($new_pass);
				
				$stmt = $mysqli->prepare("UPDATE accounts SET crypt_pass=? WHERE username=? and email_address=?");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('sss', $crypt_new_pass, $login, $email);
				$stmt->execute();
				$stmt->close();
				
				$subject = "New Password from SimpleNews!";
				$body = "Hi,\n\nYour new password is: ".$new_pass."\n\nHave a nice day!\n";
				if (mail($email, $subject, $body)) {
	                                $_SESSION['success'] = "Message sent successfully!";
				} else {
					$_SESSION['error'] = 'Message sent failed';
				}
				
				header('Location: login.php');
				exit();
			}
                }
        }

        header('Location: login.php');
        exit();	
?>
