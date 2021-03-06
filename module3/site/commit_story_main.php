<article>
    <header>
        <div class="title"><h2><a href="#"> Commit new Story </a></h2></div>
    </header>
    <div class="article-content">
        <form class="default-form" action="<?php echo process_text($submit_page); ?>" method="post">
            <div class="story-title">
                <label for="title">Title:</label>
                <input type="text" name="title" id="title" value="<?php echo process_text($story_title); ?>">
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
                            if ($story_category_id != $category_id) {
                                echo '<option value="'.process_text($category_id).'">'.process_text($category_name).'</option>';
                            } else {
                                echo '<option selected="selected" value="'.process_text($category_id).'">'.process_text($category_name).'</option>';
                            }
                        }
                        
                        $stmt->close();
                    ?>
                </select> 
            </div>
            <div class="body_text">
                <label for="body_text">Body text:</label>
                <textarea class="body_text" id="body_text" name="body_text" rows="20" cols="100"><?php echo process_text($story_body_text); ?></textarea>
            </div>
            <input type="hidden" name="story_id" value="<?php echo process_text($story_id); ?>" />
            <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
            <input class="submit-default" type="submit" value="Submit">
        </form>            
    </div>
</article>