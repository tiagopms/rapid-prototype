<?php
    if(isset($_SESSION['error']) && !empty($_SESSION['error'])) {
        echo '<span class="error" id="'.htmlentities($title).'">'.htmlentities($_SESSION['error']).'</span>';
        unset($_SESSION['error']);
    }
    if(isset($_SESSION['success']) && !empty($_SESSION['success'])) {
        echo '<span class="success" id="'.htmlentities($title).'">'.htmlentities($_SESSION['success']).'</span>';
        unset($_SESSION['success']);
    }
?>
