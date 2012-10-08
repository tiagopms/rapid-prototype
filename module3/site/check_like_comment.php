<?php
    $redirect = "login.php";
    $user_logged = true; 
    include "start.php";
    
    if ($_POST['token'] != $_SESSION['token']) {
        $_SESSION['error'] = 'Invalid request.';
        header('Location: login.php');
        exit();
    }
    
    if (isset($_POST['comment_id']) && isset($_POST['story_id'])) {
        $comment_id = $_POST["comment_id"];
        $story_id = $_POST["story_id"];
        if (isset($_REQUEST['positive'])) {
            $positive = 'true';    
        } else {
            $positive = 'false'; 
        }
        
        $id = $_SESSION["user_id"];
        
        if ($comment_id == "" || $story_id == "" || $positive == "") {
            $_SESSION['error'] = 'Invalid request.';
            header('Location: login.php');
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*) FROM comments WHERE id=?");
            if(!$stmt){
                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                exit;
            }

            $stmt->bind_param('s', $comment_id);
            $stmt->execute();
            $stmt->bind_result($found);
            $stmt->fetch();

            if (!$found) {
                $_SESSION['error'] = 'Invalid request';
                header('Location: login.php');
                exit();
            } else {
                $stmt->close();
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM comments_likes WHERE account_id=? and comment_id=?");
                if(!$stmt){
                    printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                    exit;
                }
                
                $stmt->bind_param('ss', $id, $comment_id);
                $stmt->execute();
                $stmt->bind_result($found);
                $stmt->fetch();
                
                $stmt->close();
                
                if (!$found) {
                    $stmt = $mysqli->prepare("INSERT INTO comments_likes (account_id, comment_id, positive) VALUES (?, ?, ?)");
                    if(!$stmt){
                        printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                        exit;
                    }
                    
                    $stmt->bind_param('sss', $id, $comment_id, $positive);
                    $stmt->execute();
                    $stmt->close();
                    
                    header('Location: story.php?story='.$story_id);
                    exit();
                } else {
                    $stmt = $mysqli->prepare("UPDATE comments_likes SET positive=? WHERE account_id=? and comment_id=?");
                    if(!$stmt){
                        printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                        exit;
                    }
                    
                    $stmt->bind_param('sss', $positive, $id, $comment_id);
                    $stmt->execute();
                    $stmt->close();
                    
                    header('Location: story.php?story='.$story_id);
                    exit();
                }
            }
        }
    } else {
        $_SESSION['error'] = 'Invalid post.';
        
    }

    header('Location: home.php');
    exit(); 
?>
