<?php
	$title = "Admin";
    $redirect = "login.php";
    $user_logged = true;
    include "start.php";
    if (!$admin) {
    	header("Location: home.php");
        exit();
    }
    $main_page = "admin_main.php";
    include "base.php";
    
?>
