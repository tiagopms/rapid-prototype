<?php
    $redirect = "login.php";
    $user_logged = true; 
    include "start.php";
    if (!$admin) {
        $_SESSION['error'] = 'User isn\'t admin.';
        header("Location: home.php");
        exit();
    }
    
    if ($_POST['token'] != $_SESSION['token']) {
        $_SESSION['error'] = 'Invalid request.';
        header('Location: login.php');
        exit();
    }

    
    if (isset($_POST['category'])) {
        $cat_id = $_POST["category"];
    
        if ($cat_id == "") {
            $_SESSION['error'] = 'No category selected.';
            header('Location: admin.php');
            exit();
        } 
            
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM categories WHERE id=?");
        if(!$stmt){
            printf("Query Prep 2 Failed: %s\n", $mysqli->error);
            exit;
        }

        $stmt->bind_param('s', $cat_id);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        if(!$found) {
            $_SESSION['error'] = 'Invalid category selected.';
            header('Location: admin.php');
            exit();
        }
                   
                
                
        $stmt = $mysqli->prepare("DELETE FROM categories WHERE id=?");
        if(!$stmt){
            printf("Query Prep 3 Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->bind_param('s', $cat_id);
        $stmt->execute();
        $stmt->close();
                
        $_SESSION['success'] = 'Category successfully deleted.';
        header('Location: admin.php');
        exit();
       
    }
    header('Location: admin.php');
    exit(); 
?>
