<script type="text/javascript">
    $(document).ready(function() {
        $(".edit-comment").hide();
        $(".edit-comment-link").click(function() {
            var id = $(this).attr('id').split("-")[1];
            if ($(this).text() == "Edit") {
                $(this).text("Cancel editing");
                $("#show-comment-"+id).hide(); 
                $("#edit-comment-"+id).show();
            } else {
                $(this).text("Edit");
                $("#show-comment-"+id).show(); 
                $("#edit-comment-"+id).hide();
            }
        });
    });
    
</script>
<div class="comments">
    <?php
        if ($user_logged) {
    ?>
            <h3> Comment </h3>
            <form class="default-form" action="check_coment.php" method="post">
                <textarea name="coment_text" class="body_text" rows="4"></textarea>
                <input type="hidden" name="story_id" value="<?php echo process_text($story_id); ?>" />
                <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
                <input class="submit-default" type="submit" value="Comment">
            </form>
    <?php
        }
    ?>
    <h3> Comments </h3>
    <?php
        $stmt = $mysqli->prepare(
            "SELECT comments.id, text, commit_time, username, email_address, accounts.id as user_id, (IFNULL(likes_table.likes, 0) - IFNULL(dislikes_table.dislikes, 0)) as number_likes
            FROM comments
                JOIN accounts on (comments.account_id=accounts.id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) as likes, comment_id
                    FROM comments_likes
                    WHERE positive='true'
                    GROUP BY comment_id
                ) AS likes_table ON (comments.id=likes_table.comment_id)
                LEFT OUTER JOIN (
                    SELECT COUNT(*) as dislikes, comment_id
                    FROM comments_likes
                    WHERE positive='false'
                    GROUP BY comment_id
                ) AS dislikes_table ON (comments.id=dislikes_table.comment_id)
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
        $count = 0;

        while($stmt->fetch()) {
            $count += 1;
            if ($number_of_likes > 0) {
                $likes_word = "positive";
            } else if ($number_of_likes < 0) {
                $likes_word = "negative";
            } else {
                $likes_word = "";
            }
            $commenter_gravatar = md5($email);
    ?>
            <article class="comment">
                <header>
                    <span class="likes <?php echo process_text($likes_word); ?>"><?php echo process_text($number_of_likes); ?></span>
                    <span class="like">
                        <form action="check_like_comment.php" method="post"> 
                            <input type="hidden" value="<?php echo process_text($story_id); ?>" name="story_id"/>
                            <input type="hidden" value="<?php echo process_text($comment_id); ?>" name="comment_id"/>
                            <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
                            <input class="submit-like" type="submit" name="positive" value="+">
                            <input class="submit-dislike" type="submit" name="negative" value="-">
                        </form>
                    </span>

                    <div class="user-expand">
                        <img class="user-image-expand" src="http://en.gravatar.com/avatar/<?php echo process_text($commenter_gravatar); ?>?s=50&d=mm">
                    </div>

                    <div class="user-name"> <?php echo process_text($username); ?> </div>
                    <div class="clear"> </div>
                    <span class="time-comment">
                        <time datetime="<?php echo process_text($commit_time); ?>">
                            <?php
                                $story_time = strtotime($commit_time); 
                                echo process_text(date("d F Y - h:ia", $story_time));
                            ?>
                        </time>
                    </span>
                </header>
                <p class="comment-content" id="show-comment-<?php echo process_text($comment_id); ?>">
                    <?php echo nl2br(detect_links(process_text($text))); ?>
                </p>
                <?php
                    $is_user = var_dump($commiter_id == $user);
                    echo $is_user;
                    if ($admin || $is_user) {
                        echo $admin;
                        echo $commiter_id;
                        echo $user;
                        echo 'a'.($commiter_id == $user);
                ?>
                        <div class="edit-comment" id="edit-comment-<?php echo process_text($comment_id); ?>">
                            <form action="check_edit_comment.php" method="POST">
                                <textarea name="coment_text" class="body_text" rows="4"><?php echo process_text($text); ?></textarea>
                                <input type="hidden" value="<?php echo process_text($story_id); ?>" name="story_id"/>
                                <input type="hidden" value="<?php echo process_text($comment_id); ?>" name="comment_id"/>
                                <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
                                <input type="submit" value="Edit"/>
                            </form>
                        </div>
                        <a class="edit-comment-link" id="link-<?php echo process_text($comment_id); ?>">Edit</a>
                        <div class="delete">
                            <form action="check_delete_comment.php" method="POST">
                                <input type="hidden" value="<?php echo process_text($story_id); ?>" name="story_id"/>
                                <input type="hidden" value="<?php echo process_text($comment_id); ?>" name="comment_id"/>
                                <input type="hidden" name="token" value="<?php echo process_text($_SESSION['token']); ?>" />
                                <input type="submit" value="Delete"/>
                             </form>
                        </div>
                <?php
                    }
                ?>
            </article>
    <?php
        }
        if ($count == 0) {
            echo "There is no comments yet";
        }
        $stmt->close();
    ?>
</div>