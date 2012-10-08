<?php
    $redirect = "login.php";
    $user_logged = true; 
    include "start.php";
    if (!$admin) {
    	$_SESSION['error'] = 'User isn\'t admin.';
        header("Location: home.php");
        exit();
    }

    if ($_POST['token'] != $_SESSION['token']) {
        $_SESSION['error'] = 'Invalid request.';
        header('Location: login.php');
        exit();
    }


    if (isset($_POST['category_name'])) {
        $new_cat = $_POST["category_name"];
	
        if ($new_cat == "") {
			$_SESSION['error'] = 'Category can\'t have empty name.';
			header('Location: admin.php');
			exit();
        } 
                 
		
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM categories WHERE name=?");
        if(!$stmt){
            printf("Query Prep 2 Failed: %s\n", $mysqli->error);
            exit;
        }

        $stmt->bind_param('s', $new_cat);
        $stmt->execute();
        $stmt->bind_result($found);
        $stmt->fetch();
        $stmt->close();
        
        if ($found) {
			$_SESSION['error'] = 'Category name already exists.';
			header('Location: admin.php');
			exit();
		}
			
			
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

    header('Location: admin.php');
    exit();	
?>
