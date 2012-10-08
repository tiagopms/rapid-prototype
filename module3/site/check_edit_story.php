<?php
    $redirect = "login.php";
    $user_logged = true; 
    include "start.php";
        
    if ($_POST['token'] != $_SESSION['token']) {
        $_SESSION['error'] = 'Invalid request.';
        header('Location: login.php');
        exit();
    }
        
    if (isset($_POST['story_id']) && isset($_POST['body_text']) && isset($_POST['title']) && isset($_POST['category'])) {
        $story_id = $_POST["story_id"];
        $title = $_POST["title"];
        $category_id = $_POST["category"];
        $body_text = $_POST["body_text"];
        
        $id = $_SESSION["user_id"];
        
        if ($story_id == "") {
            $_SESSION['error'] = 'Invalid request.';
            header('Location: home.php');
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories WHERE id=? and account_id=?");
            if(!$stmt){
                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                exit;
            }
            
            $stmt->bind_param('ss', $story_id, $id);
            $stmt->execute();
            $stmt->bind_result($found);
            $stmt->fetch();

            $stmt->close();
            
            if (!$found && !$admin) {
                $_SESSION['error'] = 'You don\'t have permission for that';
                header('Location: story.php?story='.$story_id);
                exit();
            } else {
                $stmt = $mysqli->prepare("UPDATE stories SET text=?, title=?, category_id=? WHERE id=?");
                if(!$stmt){
                    printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                    exit;
                }
                
                $stmt->bind_param('ssss', $body_text, $title, $category_id, $story_id);
                $stmt->execute();
                $stmt->close();
                
                header('Location: story.php?story='.$story_id);
                exit();
            }
        }
    }

    header('Location: home.php');
    exit(); 
?>
