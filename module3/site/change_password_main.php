<article>
    <header>
        <div class="title"><h2><a href="#"> Sign Up </a></h2></div>
    </header>
    <div class="article-content">
        <form class="default-form" action="check_change_password.php" method="post">
            <div class="old_password">
                <label for="old_password">Old Password:</label>
                <input type="password" name="old_password" id="old_password">
            </div>
            <div class="new_password">
                <label for="new_password">New Password:</label>
                <input type="password" name="new_password" id="new_password">
            </div>
            <div class="check_password">
                <label for="check_password">Repeat Password:</label>
                <input type="password" name="check_password" id="check_password">
            </div>
            <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
            <input class="submit-default" type="submit" value="Submit">
        </form>            
    </div>
</article>