<?php
        $title = "Sign Up";
        $redirect = "login.php";
        $user_logged = true; 
        include "header.php";
        require 'database.php';
	if (isset($_POST['story_id'])) {
                $story_id = $_POST["story_id"];
		
                $id = $_SESSION["user_id"];

                if ($story_id == "") {
                        $_SESSION['error'] = 'Invalid request.';
                        header('Location: login.php');
                        exit();
                } else {
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories WHERE id=? and account_id=?");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }

                        $stmt->bind_param('ss', $story_id, $id);
                        $stmt->execute();
                        $stmt->bind_result($found);
                        $stmt->fetch();

                        $stmt->close();
                        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE id=? and admin='true'");
                        if(!$stmt){
                                printf("Query Prep 1 Failed: %s\n", $mysqli->error);
                                exit;
                        }

                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $stmt->bind_result($found2);
                        $stmt->fetch();

                        $stmt->close();

                        if (!$found && !$found2) {
                                $_SESSION['error'] = 'You don\'t have permission for that';
                                header('Location: story.php?story='.$story_id);
                                exit();
                        } else {

?>
		<div class="edit_story_box">
			<span class="title">
				<label for="title">Title:</label>
				<?php
					
					
					$stmt = $mysqli->prepare("select title, text, name from categories join stories on (stories.category_id=categories.id) where stories.id=?");
					if(!$stmt){
						printf("Query Prep Failed: %s\n", $mysqli->error);
						exit;   
					}       
					
					$stmt->bind_param('s', $story_id);
					$stmt->execute();
					$stmt->bind_result($title, $body_text, $category_name);

					$stmt->fetch();
					
					echo '<span>'.$title.'</span>';
					
					$stmt->close();
				?>
			</span>
			<span class="category">
				<label for="category">Category:</label>
				<span>
					<?php
						echo '<span>'.$category_name.'</span>';
					?>
				</span> 
			</span>
			<form action="check_edit_story.php" method="POST">
				<span class="body_text">
					<label for="body_text">Body text:</label>
					<TEXTAREA name="body_text", rows="20", cols="100"><?php echo htmlentities($body_text); ?> </TEXTAREA>
				</span></br>
				<span class="submit_button">
                                        <input type="hidden" name="story_id" value="<?php echo $story_id; ?>" />
					<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
					<input type="submit" name="signup" value="Submit"/>
				</span>
			</form>
			<span class="cancel_button">
				<a href="home.php">Cancel</a>
			</span>
		</div>
<?php
			}
		}
	} else {
		header('Location: home.php');
		exit();
	}
?>
	</div>
</body>
</html>

