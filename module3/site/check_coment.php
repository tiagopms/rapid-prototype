<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
	if ($_POST['token'] != $_SESSION['token']) {
		$_SESSION['error'] = 'Invalid request.';
		header('Location: login.php');
		exit();
	}
	
        if (isset($_POST['coment_text']) && isset($_POST['story_id'])) {
                $story_id = $_POST["story_id"];
                $coment_text = $_POST["coment_text"];
		
		$id = $_SESSION["user_id"];
		
                if ($story_id == "" || $coment_text == "") {
                	if ($coment_text == "") {
				$_SESSION['error'] = 'Can\'t submit empty coment.';
				header('Location: story.php');
				exit();
			} else {
				$_SESSION['error'] = 'Invalid request.';
				header('Location: story.php');
				exit();
			}
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
                                header('Location: story.php');
                                exit();
                        } else {
				$stmt->close();
				
				$stmt = $mysqli->prepare("INSERT INTO comments (text, account_id, story_id) VALUES (?, ?, ?)");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('sss', $coment_text, $id, $story_id);
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
