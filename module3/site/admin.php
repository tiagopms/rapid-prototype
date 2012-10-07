<?php
        $title = "Sign Up";
        $redirect = "login.php";
        $user_logged = true; 
        include "header.php";
        require 'database.php';
?>
		<div class="admin_box">
			<div class="add_category">
				<span class="title">
					<label for="title">Add new category:</label>
				</span></br>
				<form action="check_add_category.php" method="POST">
					<span class="body_text">
						<label for="body_text">Name:</label>
						<input type="text" name="category_name"/>
					</span></br>
					<span class="submit_button">
						<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
						<input type="submit" name="signup" value="Submit"/>
					</span>
				</form>
			</div>
			<div class="add_category">
				<span class="title">
					<label for="title">Delete category:</label>
				</span>
				<form action="check_delete_category.php" method="POST">
					<span class="category">
						<label for="category">Category:</label>
						<select name="category" id="category">
							<?php
								$stmt = $mysqli->prepare("select id, name from categories");
								if(!$stmt){
									printf("Query Prep Failed: %s\n", $mysqli->error);
									exit;
								}
								 
								$stmt->execute();
								$stmt->bind_result($category_id, $category_name);
								 
								while($stmt->fetch()){
									echo '<option value="'.$category_id.'">'.$category_name.'</option>';
								}
								
								$stmt->close();
							?>
						</select> 
					</span>
					<span class="submit_button">
						<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
						<input type="submit" name="signup" value="Submit"/>
					</span>
				</form>
			</div>
			<div class="add_admin">
				<span class="title">
					<label for="title">Add admin:</label>
				</span>
				<form action="check_add_admin.php" method="POST">
					<span class="user">
						<label for="user">Username:</label>
						<select name="new_admin_id" id="user">
							<?php
								$stmt = $mysqli->prepare("select id, username from accounts where admin='false'");
								if(!$stmt){
									printf("Query Prep 2 Failed: %s\n", $mysqli->error);
									exit;
								}
								 
								$stmt->execute();
								$stmt->bind_result($new_admin_id, $new_admin_username);
								 
								while($stmt->fetch()){
									echo '<option value="'.$new_admin_id.'">'.$new_admin_username.'</option>';
								}
								
								$stmt->close();
							?>
						</select> 
					</span>
					<span class="submit_button">
						<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
						<input type="submit" name="signup" value="Submit"/>
					</span>
				</form>
			</div>
			<span class="back_button">
				<a href="home.php">Back</a>
			</span>
		</div>
	</div>
</body>
</html>

