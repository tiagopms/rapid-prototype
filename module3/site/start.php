<?php
    session_start();
    date_default_timezone_set('America/Chicago');
    if (isset($_SESSION['user_id']) xor $user_logged) {
        header("Location: $redirect");
        exit();
    }
    $elements_by_page = 5;
?>