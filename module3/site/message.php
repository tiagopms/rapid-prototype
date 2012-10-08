<?php
    if(isset($_SESSION['error']) && !empty($_SESSION['error'])) {
        echo '<span class="error">'.htmlentities($_SESSION['error']).'</span>';
        unset($_SESSION['error']);
    }
    if(isset($_SESSION['success']) && !empty($_SESSION['success'])) {
        echo '<span class="success">'.htmlentities($_SESSION['success']).'</span>';
        unset($_SESSION['success']);
    }
?>
