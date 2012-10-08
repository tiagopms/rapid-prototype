<?php
    if (isset($_GET['story']) && $_GET['story'] > 0) {
        $story_id = $_GET['story'];
    } else {
        $story_id = 1;
    }
    
    $stmt = $mysqli->prepare(
        "SELECT COUNT(*), title, commit_time, text, username, email_address, accounts.id AS user_id, (IFNULL(likes_table.likes, 0) - IFNULL(dislikes_table.dislikes, 0)) AS number_likes, IFNULL(comments_table.number_comments, 0) AS coments, categories.name, categories.id
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
        WHERE stories.id=?;"
    );
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    
    $stmt->bind_param('s', $story_id);
    $stmt->execute();
    $stmt->bind_result($found, $title, $commit_time, $story_text, $commiter_username, $commiter_email, $commiter_id, $number_likes, $number_comments, $category_name, $category_id);
    $stmt->fetch();
    $stmt->close();

    if(!$found){
        $_SESSION['error'] = 'Invalid story';
        header('Location: home.php');
        exit();
    }
    if ($number_likes > 0) {
        $likes_word = "positive";
    } else if ($number_likes < 0) {
        $likes_word = "negative";
    } else {
        $likes_word = "";
    }
    $commiter_gravatar = md5($commiter_email);
?>

<article>
    <header class="header-article-expand">
        <span class="likes <?php echo process_text($likes_word); ?>"><?php echo process_text($number_likes); ?></span>
        <?php
            if ($user_logged) {
        ?>
                <span class="like">
                    <form action="check_like.php" method="post"> 
                        <input type="hidden" value="<?php echo process_text($story_id); ?>" name="story_id"/>
                        <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
                        <input class="submit-like" type="submit" name="positive" value="+">
                        <input class="submit-dislike" type="submit" name="negative" value="-">
                    </form>
                </span>
        <?php
            }
        ?>
   
        <div class="user-expand">
            <img class="user-image-expand" src="http://en.gravatar.com/avatar/<?php echo process_text($commiter_gravatar);?>?s=70&d=mm">
        </div>
        <div class="title"> <a href="story.php?story=<?php echo process_text($story_id); ?>"> <?php echo process_text($title); ?> </a> </div>
        
        <div class="info">
            <div class="clear"></div>
            <span class="show-username"> Posted by: <?php echo process_text($commiter_username); ?> </span>
            <span class="info-line1">
                <span class="comments"><?php echo process_text($number_comments); ?> comments</span><span class="separator"> - </span>
                <span class="time">
                    <time datetime="<?php echo process_text($commit_time); ?>">
                        <?php
                            $story_time = strtotime($commit_time); 
                            echo process_text(date("d F Y - h:ia", $story_time));
                        ?>
                    </time>
                </span>
            </span>
            <span class="info-line2">
                <span class="category"><a href="home.php?category=<?php echo process_text($category_id); ?>"> <?php echo process_text($category_name); ?> </a></span>
                <?php
                    if ($user_logged && ($admin || $commiter_id==$user)) {
                ?>
                        <span class="separator"> - </span>
                        <span class="edit"><a href="edit_story.php?story=<?php echo process_text($story_id); ?>"> edit </a></span>
                        <span class="separator"> - </span>
                        <span class="remove">
                            <form class="form-remove" action="check_delete_story.php" method="POST">
                                <input type="hidden" value="<?php echo process_text($story_id); ?>" name="story_id"/>
                                <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
                                <input class="submit-remove" type="submit" value="remove"/>
                             </form>
                        </span>
                <?php
                    }
                ?>
            </span>
        </div>

    </header>
    <div class="article-content">
        <p><?php echo nl2br(detect_links(process_text($story_text))); ?></p>
        <?php include "comments_main.php"; ?>
    </div>
</article>