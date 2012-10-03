<?php
	session_start();
	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		if (isset($_SESSION['user'])) {

			if(!isset($_POST['token']) || $_POST['token'] == "" || $_SESSION['token'] != $_POST['token']) {
				$_SESSION['error'] = 'Remove file forgery detected';
 				header('Location: login.php');
				exit();
			}

			//if ($_POST['link']	
			$username = $_SESSION['user'];
			$file = $_POST['link'];
			$link = "../../FileManagement/users/$username/$file";
			if (file_exists($link)) {
				unlink("./".$link);
				header('Location: home.php');
				exit();
			}
		}
	}
	$_SESSION['error'] = "Cannot delete file";
	header('Location: login.php');
	exit();
	
?>

