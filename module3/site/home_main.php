<?php
    $current_category = (isset($_GET['category'])) ? $_GET['category'] : -1;

    if ($current_category == -1) {
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories");
    } else {
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories WHERE category_id=?");
        
    }
    
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    
    if ($current_category != -1) {
        $stmt->bind_param('s', $current_category);
    }
    $stmt->execute();
    $stmt->bind_result($len);
    $stmt->fetch();

    $pages = ceil($len / $elements_by_page);
    
    $stmt->close();
    
    if (isset($_GET['page']) && $_GET['page'] <= $pages && $_GET['page'] > 0) {
        $current_page = $_GET['page'];
    } else {
        $current_page = 1;
    }
     
    if ($current_category == -1) {
        $stmt = $mysqli->prepare(
            "SELECT stories.id AS story_id, title, commit_time, text, username, email_address, accounts.id AS user_id, (IFNULL(likes_table.likes, 0) - IFNULL(dislikes_table.dislikes, 0)) AS number_likes, IFNULL(comments_table.number_comments, 0) AS coments, categories.name, categories.id
            FROM stories
                JOIN accounts ON (stories.account_id=accounts.id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS likes, story_id
                    FROM stories_likes
                    WHERE positive='true'
                    GROUP BY story_id
                ) AS likes_table ON (stories.id=likes_table.story_id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS dislikes, story_id
                    FROM stories_likes
                    WHERE positive='false'
                    GROUP BY story_id
                ) AS dislikes_table ON (stories.id=dislikes_table.story_id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS number_comments, story_id
                    FROM comments
                    GROUP BY story_id
                ) AS comments_table ON (stories.id=comments_table.story_id)
                JOIN categories ON (stories.category_id=categories.id)
            ORDER BY commit_time DESC;"
        );
    } else {
        $stmt = $mysqli->prepare(
            "SELECT stories.id AS story_id, title, commit_time, text, username, email_address, accounts.id AS user_id, (IFNULL(likes_table.likes, 0) - IFNULL(dislikes_table.dislikes, 0)) AS number_likes, IFNULL(comments_table.number_comments, 0) AS coments, categories.name, categories.id
            FROM stories
                JOIN accounts ON (stories.account_id=accounts.id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS likes, story_id
                    FROM stories_likes
                    WHERE positive='true'
                    GROUP BY story_id
                ) AS likes_table ON (stories.id=likes_table.story_id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS dislikes, story_id
                    FROM stories_likes
                    WHERE positive='false'
                    GROUP BY story_id
                ) AS dislikes_table ON (stories.id=dislikes_table.story_id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS number_comments, story_id
                    FROM comments
                    GROUP BY story_id
                ) AS comments_table ON (stories.id=comments_table.story_id)
                JOIN categories ON (stories.category_id=categories.id)
            WHERE category_id=?    
            ORDER BY commit_time DESC;"
        );
    }

    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    if ($current_category != -1) {
        $stmt->bind_param('s', $current_category);
    }
    $stmt->execute();
    $stmt->bind_result($story_id, $title, $commit_time, $story_text, $commiter_username, $commiter_email, $commiter_id, $number_likes, $number_comments, $category_name, $category_id);
    
    $counter = 0;
    while($stmt->fetch()){
        if($counter >= ($current_page - 1)*$elements_by_page && $counter < ($current_page)*$elements_by_page) {
            if (number_likes > 0) {
                $likes_word = "positive";
            } else if (number_likes < 0) {
                $likes_word = "negative";
            } else {
                $likes_word = "";
            }
            $commiter_gravatar = md5($email);

?>
            <article>
                <header>
                    <div class="user">
                        <span class="likes <?php echo htmlentities($likes_word); ?>"><?php echo htmlentities($number_likes); ?></span>
                        <img class="user-image" src="http://en.gravatar.com/avatar/<?php echo htmlentities($commiter_gravatar);?>?s=40&d=mm">
                        <span class="show-username"> <?php echo htmlentities($commiter_username); ?> </span>
                    </div>
                    <div class="title"> <h2><a href="story.php?story=<?php echo htmlentities($story_id); ?>"> <?php echo htmlentities($title); ?> </a></h2> </div>
                    <div class="info">
                        <span class="info-line1">
                            <span class="comments"><?php echo htmlentities($number_comments); ?> comments</span><span class="separator"> - </span>
                            <span class="time">
                                <time datetime="<?php echo htmlentities($commit_time); ?>">
                                    <?php
                                        $story_time = strtotime($commit_time); 
                                        echo htmlentities(date("d F Y - h:ia", $story_time));
                                    ?>
                                </time>
                            </span>
                        </span>
                        <span class="info-line2">
                            <span class="category"><a href="<?php echo htmlentities($_SERVER['PHP_SELF']); ?>?category=<?php echo htmlentities($category_id); ?>"> <?php echo htmlentities($category_name); ?> </a></span>
                            
                            <?php
                                if ($admin || $commiter_id==$user) {
                            ?>
                                    <span class="separator"> - </span>
                                    <span class="edit"><a href="edit_story.php?story=<?php echo htmlentities($story_id); ?>"> edit </a></span>
                                    <span class="separator"> - </span>
                                    <span class="remove">
                                        <form action="check_delete_story.php" method="POST">
                                            <input type="hidden" value="<?php echo htmlentities($story_id); ?>" name="story_id"/>
                                            <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>" />
                                            <input type="submit" value="Like"/>
                                         </form>
                                    </span>
                            <?php
                                }
                            ?>

                        </span>
                    </div>

                </header>
                <p class="article-content"><?php echo htmlentities($story_text); ?></p>
            </article>
<?php
        }
        $counter++;
    }
    $stmt->close();
?>

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

<div class="commit_story">
    <a href="commit_story.php"> Commit new story </a>
</div>
