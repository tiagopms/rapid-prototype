<?php
        $title = "Sign Up";
        $redirect = "login.php";
        $user_logged = true; 
        include "header.php";
?>
    <div class="lost_password_box">
        <form action="check_change_password.php" method="POST">
            <span class="old_password">
                <label for="old_password">Old Password:</label>
                <input type="text" name="old_password" id="old_password"/>
            </span>
            <span class="new_password">
                <label for="new_password">New Password:</label>
                <input type="text" name="new_password" id="new_password"/>
            </span>
            <span class="check_password">
                <label for="check_password">Retype Password:</label>
                <input type="text" name="check_password" id="check_password"/>
            </span>
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

