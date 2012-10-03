<?php
	$title = "Home";
	$redirect = "login.php";
	$user_logged = true;
	$elements_by_page = 10;
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
		<ul class="files">
			<li>
				<div class="link files-title">Filename</div>
				<div class="date files-title">Upload date</div>
				<div class="download files-title">Download</div>
				<div class="delete files-title">Delete</div>
			</li>
	<?php
		//path to directory to scan
		$directory = "../../FileManagement/users/$user/";
		
		//get all image files with a .jpg extension.
		$files = glob($directory . "*");
		
		$len = count($files);
		$pages = ceil($len / $elements_by_page);
		
		if (isset($_GET['page']) && $_GET['page'] <= $pages && $_GET['page'] > 0) {
			$current_page = $_GET['page'];
		} else {
			$current_page = 1;
		} 
		$files_slice = array_slice($files, ($current_page - 1)*$elements_by_page, $elements_by_page);
			
		//print each file name
		foreach($files_slice as $file)
		{
			$filename = str_replace($directory, "", $file);

	?>
			<li class="file">
				<div class="link">
					<form action="view.php" method="POST">
						<input type="hidden" value="<?php echo $filename; ?>" name="link"/>
						<input type="submit" value="<?php echo $filename; ?>"/>
					</form>
				</div>
				<div class="date">
					<?php 
						$last_modified = filemtime($file);
						echo date("d F Y - h:ia", $last_modified);
					?>
				</div>
				<div class="download">
					<form action="download.php" method="POST">
						<input type="hidden" value="<?php echo $filename; ?>" name="link"/>
						<input type="submit" value="Download"/>
					 </form>

				</div>
				<div class="delete">
					<form action="remove.php" method="POST">
						<input type="hidden" value="<?php echo $filename; ?>" name="link"/>
						<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
						<input type="submit" value="Delete"/>
					 </form>
				</div>
			</li>
	<?php
		}
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
		<div class="upload">
			<form action="upload.php" method="post" enctype="multipart/form-data">
				<p>
					<label for="file">Filename:</label>
					<input type="file" name="file" id="file" />
					<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
				</p>
				<p><input type="submit" name="submit" value="Submit" /></p>
			</form>
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

