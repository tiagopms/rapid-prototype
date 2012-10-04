<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
	if ($_POST['token'] != $_SESSION['token']) {
		$_SESSION['error'] = 'Invalid request.';
		header('Location: login.php');
		exit();
	}
	
        if (isset($_POST['comment_id']) && isset($_POST['story_id'])) {
                $comment_id = $_POST["comment_id"];
                $story_id = $_POST["story_id"];
		
		$id = $_SESSION["user_id"];
		
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
			
                        $stmt->bind_param('ss', $comment_id, $id);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();

			$stmt->close();
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE id=? and admin='true'");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $stmt->bind_result($found2);
                        $stmt->fetch();

			$stmt->close();
			
                        if (!$found && !$found2) {
                                $_SESSION['error'] = 'You don\'t have permission for that';
				header('Location: story.php?story='.$story_id);
                                exit();
                        } else {
				$stmt = $mysqli->prepare("DELETE FROM comments WHERE id=?");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('s', $comment_id);
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
