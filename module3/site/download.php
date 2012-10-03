<?php
	session_start();
	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		if (isset($_SESSION['user'])) {
			//if ($_POST['link']	
			$username = $_SESSION['user'];
			$file = $_POST['link'];
			$link = "../../FileManagement/users/$username/$file";
			if (file_exists($link)) {
				$finfo = new finfo(FILEINFO_MIME_TYPE);
				$mime = $finfo->file($link);
				header("Content-Type: ".$mime);
				header("Content-Disposition: attachment; filename=\"".$file."\"");
				readfile($link);
				exit();
			}
		}
	}
	$_SESSION['error'] = "Cannot download file";
	header('Location: login.php');
	exit();
	
?>

