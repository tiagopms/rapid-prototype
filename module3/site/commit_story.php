<?php
    $title = "Commit new story";
    $redirect = "login.php";
    $user_logged = true; 
    include "start.php";
	$user = $_SESSION['user_id'];
    require 'database.php';
    $main_page = "commit_story_main.php";
    include "base.php";
?>
