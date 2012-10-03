<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
	if ($_POST['token'] != $_SESSION['token']) {
		$_SESSION['error'] = 'Invalid request.';
		header('Location: login.php');
		exit();
	}
	
        if (isset($_POST['positive']) && isset($_POST['story_id'])) {
                $story_id = $_POST["story_id"];
                $positive = $_POST["positive"];
		
		$id = $_SESSION["user_id"];
		
                if ($story_id == "" || $positive == "") {
			$_SESSION['error'] = 'Invalid request.';
			header('Location: login.php');
			exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories WHERE id=?");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $story_id);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();

                        if (!$found) {
                                $_SESSION['error'] = 'Invalid request';
                                header('Location: login.php');
                                exit();
                        } else {
				$stmt->close();
				$stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories_likes WHERE account_id=? and story_id=?");
				if(!$stmt){
					printf("Query Prep 1 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('ss', $id, $story_id);
				$stmt->execute();
				$stmt->bind_result($found);
				$stmt->fetch();
				
				$stmt->close();
				
				if (!$found) {
					$stmt = $mysqli->prepare("INSERT INTO stories_likes (account_id, story_id, positive) VALUES (?, ?, ?)");
					if(!$stmt){
						printf("Query Prep 2 Failed: %s\n", $mysqli->error);
						exit;
					}
					
					$stmt->bind_param('sss', $id, $story_id, $positive);
					$stmt->execute();
					$stmt->close();
					
					header('Location: story.php?story='.$story_id);
					exit();
				} else {
					$stmt = $mysqli->prepare("UPDATE stories_likes SET positive=? WHERE account_id=? and story_id=?");
					if(!$stmt){
						printf("Query Prep 2 Failed: %s\n", $mysqli->error);
						exit;
					}
					
					$stmt->bind_param('sss', $positive, $id, $story_id);
					$stmt->execute();
					$stmt->close();
					
					header('Location: story.php?story='.$story_id);
					exit();
				}
			}
                }
        }

        header('Location: home.php');
        exit();	
?>
