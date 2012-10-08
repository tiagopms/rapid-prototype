<?php
    $redirect = "login.php";
    $user_logged = true; 
    include "start.php";
    
    if ($_POST['token'] != $_SESSION['token']) {
        $_SESSION['error'] = 'Invalid request.';
        header('Location: login.php');
        exit();
    }
    
    if (isset($_POST['comment_id']) && isset($_POST['story_id']) && isset($_POST['coment_text'])) {
        $comment_id = $_POST["comment_id"];
        $story_id = $_POST["story_id"];
        $comment_text = $_POST['coment_text'];

        if ($comment_id == "" && $story_id == "") {
            $_SESSION['error'] = 'Invalid request.';
            header('Location: home.php');
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*) FROM comments WHERE id=? and account_id=?");
            if(!$stmt){
                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                exit;
            }

            $stmt->bind_param('ss', $comment_id, $user);
            $stmt->execute();
            $stmt->bind_result($found);
            $stmt->fetch();
            $stmt->close();
        
            if (!$found && !$admin) {
                $_SESSION['error'] = 'You don\'t have permission for that';
                header('Location: story.php?story='.$story_id);
                exit();
            } 
            
            $stmt = $mysqli->prepare("UPDATE comments SET text=? WHERE id=?");
            if(!$stmt){
                printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                exit();
            }
    
            $stmt->bind_param('ss', $comment_text, $comment_id);
            $stmt->execute();
            $stmt->close();
    
            header('Location: story.php?story='.$story_id);
            exit();
            
        }
    }

    header('Location: home.php');
    exit(); 
?>
