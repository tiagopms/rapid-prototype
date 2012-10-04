<?php
	if ($user_logged) {
		$stmt = $mysqli->prepare("SELECT username, email_address, admin FROM accounts WHERE id=?");
		if(!$stmt){
			printf("Query Prep Failed: %s\n", $mysqli->error);
			exit;
		}

		$stmt->bind_param('s', $user);
		$stmt->execute();
		$stmt->bind_result($name, $email, $admin);
		$stmt->fetch();
		$stmt->close();

		$gravatar = md5($email);
		echo '<img class="header-img" src="http://en.gravatar.com/avatar/'.$gravatar.'?s=70&d=mm">';
		echo '<span class="welcome"> Hello, '.$name.'! </span>';
?>
		<a href="my_stories.php">View my Stories</a>
		<form class="form-logout" action="logout.php" method="POST">
			<input class="logout-button" type="submit" value="Logout"/>
		</form>
		<a href="change_password.php">Change Password</a>
<?php
		if ($admin == "true") {
			echo '<a class="admin-cp" href="admincp.php"> Admin CP </a>';
		}
	}
?>


