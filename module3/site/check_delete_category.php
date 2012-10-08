<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
        if ($_POST['token'] != $_SESSION['token']) {
                $_SESSION['error'] = 'Invalid request.';
                header('Location: login.php');
                exit();
        }

	
        if (isset($_POST['category'])) {
                $cat_id = $_POST["category"];
		
		$id = $_SESSION["user_id"];
		
                if ($cat_id == "") {
			$_SESSION['error'] = 'No category selected.';
			header('Location: admin.php');
			exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE id=? and admin='true'");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();
			$stmt->close();
			
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM categories WHERE id=?");
                        if(!$stmt){
                                printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $cat_id);
                        $stmt->execute();
                        $stmt->bind_result($found2);
                        $stmt->fetch();

                        if (!$found || !$found2) {
				if(!$found)
				{
					$_SESSION['error'] = 'User isn\'t admin.';
					header('Location: home.php');
					exit();
				} else {
					$_SESSION['error'] = 'Invalid category selected.';
					header('Location: admin.php');
					exit();
				}
                        } else {
				$stmt->close();
				
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
                }
        }

        header('Location: home.php');
        exit();	
?>
