<?php
        $title = "Sign Up";
        $redirect = "home.php";
        $user_logged = false; 
        include "header.php";
?>
    <div class="lost_password_box">
        <form action="check_lost_password.php" method="POST">
            <span class="username">
                <label for="username">Username:</label>
                <input type="text" name="username" id="username"/>
            </span>
            <span class="email">
                <label for="email">Email:</label>
                <input type="text" name="email" id="email"/>
            </span>
            <span class="submit_button">
                <input type="submit" name="signup" value="Submit"/>
            </span>
        </form>
            <span class="cancel_button">
                <a href="login.php">Cancel</a>
            </span>
    </div>
</div>
</body>
</html>

