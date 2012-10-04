<?php
	$title = "Home";
	$redirect = "login.php";
	$user_logged = true;
	include "start.php";
	$user = $_SESSION['user_id'];
    require 'database.php';
    $main_page = "home_main.php";
    include "base.php";
?>
