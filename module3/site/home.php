<?php
	$title = "Home";
	$redirect = "login.php";
	$user_logged = true;
	$elements_by_page = 5;
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
	<div class="other">
		<a href="admin.php">Admin</a>
	</div>
	<div class="section">
		<ul class="files">
			<li>
				<div class="titles">Titles</div>
			</li>
	<?php
		
		$stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories");
		if(!$stmt){
			printf("Query Prep Failed: %s\n", $mysqli->error);
			exit;
		}

		$stmt->execute();
		$stmt->bind_result($len);
		$stmt->fetch();

		echo $len;
		$pages = ceil($len / $elements_by_page);
		
		$stmt->close();
		
		if (isset($_GET['page']) && $_GET['page'] <= $pages && $_GET['page'] > 0) {
			$current_page = $_GET['page'];
		} else {
			$current_page = 1;
		}
		 
		$stmt = $mysqli->prepare("SELECT id, title, commit_time, text, account_id FROM stories ORDER BY commit_time DESC");
		if(!$stmt){
			printf("Query Prep Failed: %s\n", $mysqli->error);
			exit;
		}

		$stmt->execute();
		$stmt->bind_result($story_id, $title, $commit_time, $story_text, $commiter_id);
		
		$counter = 0;
		while($stmt->fetch()){
			if($counter >= ($current_page - 1)*$elements_by_page && $counter < ($current_page)*$elements_by_page) {
	?>
			<li class="story">
				<div class="title">
					<form action="story.php" method="GET">
						<input type="hidden" value="<?php echo $story_id; ?>" name="story"/>
						<input type="submit" value="<?php echo $title; ?>"/>
					</form>
				</div>
				<div class="date">
					<?php
						$story_time = strtotime($commit_time); 
						echo date("d F Y - h:ia", $story_time);
					?>
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
			</li></br>
	<?php
			}
			$counter++;
		}$stmt->close();
	?>
		</ul>
		<div class="paginate">
			<ul>
				<?php
					for($i = 1; $i <= $pages; $i++) {
						if($i != $current_page) {
							echo '<li><a href="'.htmlentities($_SERVER['PHP_SELF']).'?page='.$i.'">'.$i.'</a></li>';
						} else {
							echo '<li><span class="current">'.$i.'</span></li>';
						}
					}
				?>
			</ul>
		</div>
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

