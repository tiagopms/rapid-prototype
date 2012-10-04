<?php
	$title = "Story";
	$redirect = "login.php";
	$user_logged = true;
	include "header.php";
	$user = $_SESSION['user_id'];
        require 'database.php';
?>
	<div class="home-header">
		<div class="welcome">
			<?php
				$stmt = $mysqli->prepare("SELECT username FROM accounts WHERE id=?");
				if(!$stmt){
					printf("Query Prep Failed: %s\n", $mysqli->error);
					exit;
				}

				$stmt->bind_param('s', $user);
				$stmt->execute();
				$stmt->bind_result($name);
				$stmt->fetch();

				echo "Hello, $name!";
				
				$stmt->close();
			?>	
		</div>

		<div class="logout">
			<form action="logout.php" method="POST">
				<p>
					<input type="submit" value="Logout"/>
				</p>
			</form>
		</div>
		<div class="change_password">
			<form action="change_password.php" method="POST">
				<p>
					<input type="submit" value="Change Password"/>
				</p>
			</form>
		</div>
	</div>
	<div class="section">
		<div class="story">
	<?php
                if (isset($_GET['story']) && $_GET['story'] > 0) {
                        $story_id = $_GET['story'];
                } else {
                        $story_id = 1;
                }
		
		$stmt = $mysqli->prepare("SELECT COUNT(*), title, commit_time, text, account_id FROM stories WHERE id=?");
		if(!$stmt){
			printf("Query Prep Failed: %s\n", $mysqli->error);
			exit;
		}
		
		$stmt->bind_param('s', $story_id);
		$stmt->execute();
		$stmt->bind_result($found, $title, $commit_time, $story_text, $commiter_id);
		$stmt->fetch();
		
		if($found){
	?>
			<div class="story">
				<div class="title">
					<span>
						<?php echo htmlentities($title); ?>
					</span>
				</div>
				<div class="date">
					<?php
						$story_time = strtotime($commit_time); 
						echo date("d F Y - h:ia", $story_time);
					?>
				</div>
				<div class="text_body">
					<textarea rows='10' cols='90'>
						<?php echo htmlentities($story_text); ?>
					</textarea>
				</div>
				
				<div class="like">
					<form action="check_like.php" method="POST">
						<input type="hidden" value="<?php echo 'true'; ?>" name="positive"/>
						<input type="hidden" value="<?php echo $story_id; ?>" name="story_id"/>
						<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
						<input type="submit" value="Like"/>
					 </form>

				</div>
				<div class="dislike">
					<form action="check_like.php" method="POST">
						<input type="hidden" value="<?php echo 'false'; ?>" name="positive"/>
						<input type="hidden" value="<?php echo $story_id; ?>" name="story_id"/>
						<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                                <input type="submit" value="Dislike"/>
                                         </form>
                                </div>
                                <div class="delete">
                                        <form action="check_delete_story.php" method="POST">
                                                <input type="hidden" value="<?php echo $story_id; ?>" name="story_id"/>
                                                <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                                <input type="submit" value="Delete"/>
                                         </form>
                                </div>
			</div></br>
	<?php
		} else {
			$_SESSION['error'] = 'Invalid story';
			header('Location: home.php');
			exit();
		}
		$stmt->close();
		
	?>
		<div class="coment">
			<form action="check_coment.php" method="POST">
                                <span class="body_text">
                                        <label for="coment_text">Coment:</label>
                                        <TEXTAREA name="coment_text", rows="3", cols="80"> </TEXTAREA>
                                </span></br>
                                <span class="submit_button">
                                        <input type="hidden" name="story_id" value="<?php echo $story_id; ?>" />
                                        <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                        <input type="submit" name="signup" value="Submit"/>
                                </span>
                        </form>
		</div>

	<?php
		
		$stmt = $mysqli->prepare("
					SELECT comments.id, text, commit_time, username, email_address, accounts.id as user_id, (IFNULL(likes_table.likes, 0) - IFNULL(dislikes_table.dislikes, 0)) as number_likes
					FROM comments
					    JOIN accounts on (comments.account_id=accounts.id)
					    LEFT OUTER JOIN (
						SELECT COUNT(*) as likes, story_id
						FROM stories_likes
						WHERE positive='true'
						GROUP BY story_id
					    ) AS likes_table ON (comments.id=likes_table.story_id)
					    LEFT OUTER JOIN (
						SELECT COUNT(*) as dislikes, story_id
						FROM stories_likes
						WHERE positive='false'
						GROUP BY story_id
					    ) AS dislikes_table ON (comments.id=dislikes_table.story_id)
					WHERE comments.story_id=?
					ORDER BY commit_time DESC");
		if(!$stmt){
			printf("Query Prep Failed: %s\n", $mysqli->error);
			exit;
		}
		
		$stmt->bind_param('s', $story_id);
		$stmt->execute();
		$stmt->bind_result($comment_id, $text, $commit_time, $username, $email, $commiter_id, $number_of_likes);
		
		while($stmt->fetch()) {
		
	?>
                                <div class="title">
                                        <span>
                                                <?php echo htmlentities($text); ?>
                                        </span>
                                </div>
                                <div class="date">
                                        <?php
                                                $story_time = strtotime($commit_time);
                                                echo date("d F Y - h:ia", $story_time);
                                        ?>
                                </div>
                                <div class="like">
                                        <form action="check_like_comment.php" method="POST">
                                                <input type="hidden" value="<?php echo 'true'; ?>" name="positive"/>
                                                <input type="hidden" value="<?php echo $story_id; ?>" name="story_id"/>
                                                <input type="hidden" value="<?php echo $comment_id; ?>" name="comment_id"/>
                                                <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                                <input type="submit" value="Like"/>
                                         </form>

                                </div>
                                <div class="dislike">
                                        <form action="check_like_comment.php" method="POST">
                                                <input type="hidden" value="<?php echo 'false'; ?>" name="positive"/>
                                                <input type="hidden" value="<?php echo $story_id; ?>" name="story_id"/>
                                                <input type="hidden" value="<?php echo $comment_id; ?>" name="comment_id"/>
                                                <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                                <input type="submit" value="Dislike"/>
                                         </form>
                                </div>
                                <div class="delete">
                                        <form action="check_delete_comment.php" method="POST">
                                                <input type="hidden" value="<?php echo $story_id; ?>" name="story_id"/>
                                                <input type="hidden" value="<?php echo $comment_id; ?>" name="comment_id"/>
                                                <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                                <input type="submit" value="Delete"/>
                                         </form>
                                </div>

        <?php
                }
                $stmt->close();
        ?>
		
		<div class="commit_story">
			<form action="commit_story.php" method="POST">
				<p>
					<input type="submit" value="Commit new story"/>
				</p>
			</form>
		</div>
	</div>
</div>
</body>
</html>

