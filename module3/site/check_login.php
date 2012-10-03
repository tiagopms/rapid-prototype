<?php
	session_start();
	include "functions.php";
	
	require 'database.php';
	
	if (isset($_POST['username']) && isset($_POST['password'])) {
		$login = $_POST["username"];
		$password = $_POST["password"];
		
		if ($login == "" || $password == "") {
			if ($login == "") {
				$_SESSION['error'] = 'Empty username';
				header('Location: login.php');
				exit();
			} else if ($password == "") {
				$_SESSION['error'] = 'Empty password';
				header('Location: login.php');
				exit();
			}
		} else {
			$stmt = $mysqli->prepare("SELECT COUNT(*), id, crypt_pass FROM accounts WHERE username=?");
			if(!$stmt){
				printf("Query Prep Failed: %s\n", $mysqli->error);
				exit;
			}
			
			$stmt->bind_param('s', $login);
			$stmt->execute();
			$stmt->bind_result($found, $existing_id, $crypt_pass);
			$stmt->fetch();
						
			if (!$found) {
				$_SESSION['error'] = 'Username not found';
				header('Location: login.php');
				exit();
			} else {
				if(crypt($password, $crypt_pass) == $crypt_pass) {
					$_SESSION['user_id'] = $existing_id;
					$_SESSION['token'] = random_token();
					header('Location: home.php');
					exit();
				} else {
					$_SESSION['error'] = 'Wrong password';
					header('Location: login.php');
					exit();
				}
			}
		}
	}
	 
	header('Location: login.php');
	exit();
?>
