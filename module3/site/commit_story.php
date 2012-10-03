<?php
        $title = "Sign Up";
        $redirect = "login.php";
        $user_logged = true; 
        include "header.php";
        require 'database.php';
?>
		<div class="commit_story_box">
			<form action="check_commit_story.php" method="POST">
				<span class="title">
					<label for="title">Title:</label>
					<input type="text" name="title" id="title"/>
				</span>
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
				<span class="body_text">
					<label for="body_text">Body text:</label>
					<TEXTAREA name="body_text", rows="20", cols="100"> </TEXTAREA>
				</span></br>
				<span class="submit_button">
					<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
					<input type="submit" name="signup" value="Submit"/>
				</span>
			</form>
			<span class="cancel_button">
				<a href="home.php">Cancel</a>
			</span>
		</div>
	</div>
</body>
</html>

