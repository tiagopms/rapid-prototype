<article>
    <header>
        <div class="title"><h2><a href="#"> Sign Up </a></h2></div>
    </header>
    <div class="article-content">
        <form class="default-form" action="check_commit_story.php" method="post">
            <div class="story-title">
                <label for="title">Title:</label>
                <input type="text" name="title" id="title">
            </div>
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
                            echo '<option value="'.$category_id.'">'.$category_name.'</option>';
                        }
                        
                        $stmt->close();
                    ?>
                </select> 
            </div>
            <div class="body_text">
                <label for="body_text">Body text:</label>
                <textarea class="body_text" name="body_text", rows="20", cols="100"> </textarea>
            </div>
            
            <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
            <input class="submit-default" type="submit" value="Submit">
        </form>            
    </div>
</article>