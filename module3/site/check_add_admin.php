<?php
        session_start();
        include "functions.php";

        require 'database.php';
	
        if ($_POST['token'] != $_SESSION['token']) {
                $_SESSION['error'] = 'Invalid request.';
                header('Location: login.php');
                exit();
        }

	
        if (isset($_POST['new_admin_id'])) {
                $new_admin_id = $_POST["new_admin_id"];
		
		$id = $_SESSION["user_id"];
		
                if ($new_admin_id == "") {
			$_SESSION['error'] = 'No user selected.';
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
			
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE id=?");
                        if(!$stmt){
                                printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                                exit;
                        }
			
                        $stmt->bind_param('s', $new_admin_id);
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
					$_SESSION['error'] = 'Invalid user selected.';
					header('Location: admin.php');
					exit();
				}
                        } else {
				$stmt->close();
				
				$stmt = $mysqli->prepare("UPDATE accounts SET admin='true' WHERE id=?");
				if(!$stmt){
					printf("Query Prep 3 Failed: %s\n", $mysqli->error);
					exit;
				}
				
				$stmt->bind_param('s', $new_admin_id);
				$stmt->execute();
				$stmt->close();
				
                                $_SESSION['success'] = 'Admin successfully created.';
				header('Location: admin.php');
				exit();
			}
                }
        }

        header('Location: home.php');
        exit();	
?>
