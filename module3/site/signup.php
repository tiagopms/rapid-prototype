<?php
        $title = "Sign Up";
        $redirect = "home.php";
        $user_logged = false; 
        include "header.php";
?>
    <div class="signup_box">
        <form action="check_signup.php" method="POST">
            <span class="username">
                <label for="username">Username:</label>
                <input type="text" name="username" id="username"/>
            </span>
            <span class="password">
                <label for="password">Password:</label>
                <input type="text" name="password" id="password"/>
            </span>
            <span class="password">
                <label for="check_password">Repeat password:</label>
                <input type="text" name="check_password" id="check_password"/>
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

