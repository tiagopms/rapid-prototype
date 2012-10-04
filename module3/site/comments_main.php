<div class="comments">
    <h3> Comment </h3>
    <form class="default-form" action="check_comment.php" method="post">
        <textarea class="coment_text" rows="4"></textarea>
        <input type="hidden" name="story_id" value="<?php echo htmlentities($story_id); ?>" />
        <input type="hidden" name="token" value="<?php echo htmlentities($_SESSION['token']); ?>" />
        <input class="submit-default" type="submit" value="Comment">
    </form>
    <h3> Comments </h3>
    <?php
        $stmt = $mysqli->prepare(
            "SELECT comments.id, text, commit_time, username, email_address, accounts.id as user_id, (IFNULL(likes_table.likes, 0) - IFNULL(dislikes_table.dislikes, 0)) as number_likes
            FROM comments
                JOIN accounts on (comments.account_id=accounts.id)
                LEFT OUTER JOIN (
                SELECT COUNT(*) as likes, story_id
                FROM stories_likes
                WHERE positive='true'
                GROUP BY story_id
                ) AS likes_table ON (comments.id=likes_table.story_id)
                LEFT OUTER JOIN (
                SELECT COUNT(*) as dislikes, story_id
                FROM stories_likes
                WHERE positive='false'
                GROUP BY story_id
                ) AS dislikes_table ON (comments.id=dislikes_table.story_id)
            WHERE comments.story_id=?
            ORDER BY commit_time DESC"
        );
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->bind_param('s', $story_id);
        $stmt->execute();
        $stmt->bind_result($comment_id, $text, $commit_time, $username, $email, $commiter_id, $number_of_likes);
        
        while($stmt->fetch()) {
            if ($number_likes > 0) {
                $likes_word = "positive";
            } else if ($number_likes < 0) {
                $likes_word = "negative";
            } else {
                $likes_word = "";
            }
            $commenter_gravatar = md5($email);
    ?>
            <article class="comment">
                <header>
                    <span class="likes <?php echo htmlentities($likes_word); ?>"><?php echo htmlentities($number_of_likes); ?></span>
                    <?php
                        //if ($user_logged && !liked_comment($user, $story_id)) {
                    ?>
                            <span class="like">
                                <form action="check_like_comment.php" method="post"> 
                                    <input type="hidden" value="<?php echo htmlentities($story_id); ?>" name="story_id"/>
                                    <input type="hidden" value="<?php echo htmlentities($comment_id); ?>" name="comment_id"/>
                                    <input type="hidden" name="token" value="<?php echo htmlentities($_SESSION['token']); ?>" />
                                    <input class="submit-like" type="submit" name="positive" value="+">
                                    <input class="submit-dislike" type="submit" name="negative" value="-">
                                </form>
                            </span>
                    <?php
                        //}
                    ?>
                    <div class="user-expand">
                        <img class="user-image-expand" src="http://en.gravatar.com/avatar/<?php echo htmlentities($commenter_gravatar); ?>?s=50&d=mm">
                    </div>

                    <div class="user-name"> <?php echo htmlentities($username); ?> </div>
                    <span class="time">
                        <time datetime="<?php echo htmlentities($commit_time); ?>">
                            <?php
                                $story_time = strtotime($commit_time); 
                                echo htmlentities(date("d F Y - h:ia", $story_time));
                            ?>
                        </time>
                    </span>
                </header>
                <p class="comment-content">
                    <?php echo htmlentities($text); ?>
                </p>
                <div class="delete">
                    <form action="check_delete_comment.php" method="POST">
                        <input type="hidden" value="<?php echo htmlentities($story_id); ?>" name="story_id"/>
                        <input type="hidden" value="<?php echo htmlentities($comment_id); ?>" name="comment_id"/>
                        <input type="hidden" name="token" value="<?php echo htmlentities($_SESSION['token']); ?>" />
                        <input type="submit" value="Delete"/>
                     </form>
                </div>

            </article>
    <?php
        }
        $stmt->close();
    ?>
</div>