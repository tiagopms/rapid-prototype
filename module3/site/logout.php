<?php
	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		session_start();
		if (isset($_SESSION['user_id'])) {
			session_destroy();
		}
	}
	header('Location: login.php');
	exit();
	
?>

