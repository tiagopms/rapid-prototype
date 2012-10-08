<article>
    <header>
        <div class="title"><h2><a href="#"> Add new category </a></h2></div>
    </header>
    <div class="article-content">
        <form class="default-form" action="check_add_category.php" method="post">
            <div class="category_name">
                <label for="category_name">Name:</label>
                <input type="text" name="category_name" id="category_name">
            </div>
            <input type="hidden" name="token" value="<?php echo htmlentities($_SESSION['token']); ?>" />
            <input class="submit-default" name="submit" type="submit" value="Submit">
        </form>            
    </div>
</article>

<article>
    <header>
        <div class="title"><h2><a href="#"> Delete category </a></h2></div>
    </header>
    <div class="article-content">
        <form class="default-form" action="check_delete_category.php" method="post">
            <div class="category">
                <label for="category">Category:</label>
                <select name="category" id="category">
                    <?php
                        $stmt = $mysqli->prepare("select id, name from categories");
                        if(!$stmt){
                            printf("Query Prep Failed: %s\n", $mysqli->error);
                            exit;
                        }
                         
                        $stmt->execute();
                        $stmt->bind_result($category_id, $category_name);
                         
                        while($stmt->fetch()){
                            echo '<option value="'.htmlentities($category_id).'">'.htmlentities($category_name).'</option>';
                        }
                        
                        $stmt->close();
                    ?>
                </select> 
            </div>
            <input type="hidden" name="token" value="<?php echo htmlentities($_SESSION['token']); ?>" />
            <input class="submit-default" name="submit" type="submit" value="Submit">
        </form>            
    </div>
</article>

<article>
    <header>
        <div class="title"><h2><a href="#"> Add admin </a></h2></div>
    </header>
    <div class="article-content">
        <form class="default-form" action="check_add_admin.php" method="post">
            <div class="user_name">
                <label for="user">User:</label>
                <select name="new_admin_id" id="user">
                    <?php
                        $stmt = $mysqli->prepare("select id, username from accounts where admin='false'");
                        if(!$stmt){
                            printf("Query Prep 2 Failed: %s\n", $mysqli->error);
                            exit;
                        }
                         
                        $stmt->execute();
                        $stmt->bind_result($new_admin_id, $new_admin_username);
                         
                        while($stmt->fetch()){
                            echo '<option value="'.htmlentities($new_admin_id).'">'.htmlentities($new_admin_username).'</option>';
                        }
                        
                        $stmt->close();
                    ?>
                </select> 
            </div>
            <input type="hidden" name="token" value="<?php echo htmlentities($_SESSION['token']); ?>" />
            <input class="submit-default" name="submit" type="submit" value="Submit">
        </form>            
    </div>
</article>
