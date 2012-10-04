<?php
	if (!isset($_GET['story'])) {
		header('Location: home.php');
		$_SESSION['error'] = 'Invalid id.';
		exit();
	}
	$story_id = $_GET["story"];
	$id = $_SESSION["user_id"];

	if ($story_id == "") {
	    $_SESSION['error'] = 'Invalid request.';
	    header('Location: login.php');
	    exit();
	} 

	$stmt = $mysqli->prepare("select title, text, name, categories.id, account_id from categories join stories on (stories.category_id=categories.id) where stories.id=?");
	if(!$stmt){
		printf("Query Prep Failed: %s\n", $mysqli->error);
		exit;   
	}       

	$stmt->bind_param('s', $story_id);
	$stmt->execute();
	$stmt->bind_result($story_title, $story_body_text, $story_category_name, $story_category_id, $story_account_id);

	$stmt->fetch();
	$stmt->close();

	if ($story_account_id != $id && !is_admin($id)) {
	    $_SESSION['error'] = 'You don\'t have permission for that';
	    header('Location: story.php?story='.$story_id);
	    exit();
	} 
	$submit_page = "check_edit_story.php";
?>