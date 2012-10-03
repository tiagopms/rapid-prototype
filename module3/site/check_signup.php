<?php
        session_start();
        include "functions.php";

        require 'database.php';

        if (isset($_POST['username']) && isset($_POST['password']) && isset($_POST['check_password']) && isset($_POST['email'])) {
                $login = $_POST["username"];
                $password = $_POST["password"];
		
                if($password != $_POST["check_password"]) {
			$_SESSION['error'] = 'Passwords don\'t match';
			header('Location: signup.php');
			exit();
		}
		
		$email = $_POST["email"];
		
                if ($login == "" || $password == "" || $email == "") {
			$_SESSION['error'] = 'All fields are necessary.';
			header('Location: signup.php');
			exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE username=?");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $login);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();

                        if ($found) {
                                $_SESSION['error'] = 'Username already exists';
                                header('Location: signup.php');
                                exit();
                        } else {
				$stmt->close();
				
				$stmt = $mysqli->prepare("INSERT INTO accounts (username, crypt_pass, email_address) VALUES (?, ?, ?)");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$crypt_pass = crypt($password);
				
				$stmt->bind_param('sss', $login, $crypt_pass, $email);
				$stmt->execute();
				$stmt->close();
				
				$stmt = $mysqli->prepare("SELECT id FROM accounts WHERE username=?");
				if(!$stmt){
					printf("Query Prep 3 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('s', $login);
				$stmt->execute();
				$stmt->bind_result($id);
				$stmt->fetch();
				
				$_SESSION['user_id'] = $id;
				$_SESSION['token'] = random_token();
				header('Location: home.php');
				exit();
			}
                }
        }

        header('Location: login.php');
        exit();	
?>
