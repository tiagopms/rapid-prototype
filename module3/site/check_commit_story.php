<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
	if ($_POST['token'] != $_SESSION['token']) {
		$_SESSION['error'] = 'Invalid request.';
		header('Location: login.php');
		exit();
	}
	
        if (isset($_POST['title']) && isset($_POST['category']) && isset($_POST['body_text'])) {
                $title = $_POST["title"];
                $category_id = $_POST["category"];
                $body_text = $_POST["body_text"];
		
		$id = $_SESSION["user_id"];
		
                if ($title == "" || $category_id == "" || $body_text == "") {
			$_SESSION['error'] = 'All fields are necessary.';
			header('Location: commit_story.php');
			exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM categories WHERE id=?");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $category_id);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();

                        if (!$found) {
                                $_SESSION['error'] = 'Category isn\'t valid';
                                header('Location: commit_story.php');
                                exit();
                        } else {
				$stmt->close();
				
				$stmt = $mysqli->prepare("INSERT INTO stories (title, text, account_id, category_id) VALUES (?, ?, ?, ?)");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('ssss', $title, $body_text, $id, $category_id);
				$stmt->execute();
				$stmt->close();
				
				header('Location: home.php');
				exit();
			}
                }
        }

        header('Location: home.php');
        exit();	
?>
