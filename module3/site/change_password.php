<?php
        $title = "Sign Up";
        $redirect = "login.php";
        $user_logged = true; 
        include "start.php";
        $user = $_SESSION['user_id'];
        require 'database.php';
        $main_page = "lost_password_main.php";
        include "base.php";
?>