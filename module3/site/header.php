<!DOCTYPE html>
<html>
<head>
        <title>File Management - <?php echo $title; ?></title>
	<link href="stylesheets.css" rel="stylesheet" type="text/css">
</head>
<body>
	<div class="content">
<?php
        session_start();
	date_default_timezone_set('America/Chicago');
        if (isset($_SESSION['user_id']) xor $user_logged) {
                header("Location: $redirect");
                exit();
        }
        if(isset($_SESSION['error']) && !empty($_SESSION['error'])) {
                echo '<div class="error" id="'.$title.'">'.$_SESSION['error'].'</div>';
                unset($_SESSION['error']);
        }
        if(isset($_SESSION['success']) && !empty($_SESSION['success'])) {
                echo '<div class="success" id="'.$title.'">'.$_SESSION['success'].'</div>';
                unset($_SESSION['success']);
        }

?>

