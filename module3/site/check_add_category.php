<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
        if ($_POST['token'] != $_SESSION['token']) {
                $_SESSION['error'] = 'Invalid request.';
                header('Location: login.php');
                exit();
        }

	
        if (isset($_POST['category_name'])) {
                $new_cat = $_POST["category_name"];
		
		$id = $_SESSION["user_id"];
		
                if ($new_cat == "") {
			$_SESSION['error'] = 'Category can\'t have empty name.';
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
			
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM categories WHERE name=?");
                        if(!$stmt){
                                printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $new_cat);
                        $stmt->execute();
                        $stmt->bind_result($found2);
                        $stmt->fetch();

                        if (!$found || $found2) {
				if(!$found)
				{
					$_SESSION['error'] = 'User isn\'t admin.';
					header('Location: home.php');
					exit();
				} else {
					$_SESSION['error'] = 'Category name already exists.';
					header('Location: admin.php');
					exit();
				}
                        } else {
				$stmt->close();
				
				$stmt = $mysqli->prepare("INSERT INTO categories (name) VALUES (?)");
				if(!$stmt){
					printf("Query Prep 2 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('s', $new_cat);
				$stmt->execute();
				$stmt->close();
				
                                $_SESSION['success'] = 'Category successfully created.';
				header('Location: admin.php');
				exit();
			}
                }
        }

        header('Location: home.php');
        exit();	
?>
