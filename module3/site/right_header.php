<?php
    if ($user_logged) {
        $stmt = $mysqli->prepare("SELECT username, email_address, admin FROM accounts WHERE id=?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }

        $stmt->bind_param('s', $user);
        $stmt->execute();
        $stmt->bind_result($name, $email, $admin);
        $stmt->fetch();
        $stmt->close();

        $gravatar = md5($email);
        echo '<img class="header-img" src="http://en.gravatar.com/avatar/'.htmlentities($gravatar).'?s=70&d=mm">';
        echo '<span class="welcome"> Hello, '.htmlentities($name).'! </span>';
?>
        <a href="my_stories.php">View my Stories</a>
        <form class="form-logout" action="logout.php" method="POST">
            <input class="logout-button" type="submit" value="Logout"/>
        </form>
        <a href="change_password.php">Change Password</a>
<?php
        if ($admin == "true") {
            echo '<a class="admin-cp" href="admin.php"> Admin CP </a>';
        }
    } else {
?>
        <form class="login-form" action="check_login.php" method="post">
            <div class="input-login">
                <div class="username">
                    <label for="username">Username:</label>
                    <input type="text" name="username" id="username">
                </div>
                <div class="password">
                    <label for="password">Password:</label>
                    <input type="password" name="password" id="password">
                </div>
            </div>
            <input class="submit-login" type="submit" value="Login" name="login">
        </form>
        <a href="lost_password.php">Lost Password?</a>
        <a href="signup.php">Sign up</a>
<?php
    }
?>


