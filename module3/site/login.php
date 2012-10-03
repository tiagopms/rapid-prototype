<?php
        $title = "Login";
        $redirect = "home.php";
        $user_logged = false; 
        include "header.php";
?>
    <div class="login-box">
        <form action="check_login.php" method="POST">
            <span class="username">
                <label for="username">Username:</label>
                <input type="text" name="username" id="username"/>
            </span>
            <span class="password">
                <label for="password">Password:</label>
                <input type="text" name="password" id="password"/>
            </span>
            <span class="login_button">
                <input type="submit" name="login" value="Login"/>
            </span>
        </form>
            <span class="signup_button">
                <a href="signup.php">Sign Up</a>
            </span>
            <span class="lost_password_button">
                <a href="lost_password.php">Lost Password</a>
            </span>
    </div>
</div>
</body>
</html>

