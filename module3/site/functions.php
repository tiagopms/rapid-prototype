<?php
function random_token() {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $size = strlen( $chars );
    $token = "";
    for($counter = 0; $counter <=35; $counter++) {
        $token .= $chars[ rand( 0, $size - 1 ) ];
    }
    return $token;
}

function is_admin($mysqli, $id) {
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE id=? and admin='true'");
    if(!$stmt){
        printf("Query Prep 1 Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->bind_param('s', $id);
    $stmt->execute();
    $stmt->bind_result($found);
    $stmt->fetch();

    $stmt->close();
    return $found;
}

function liked_story($mysqli, $accound_id, $story_id) {
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM stories_likes WHERE story_id=? AND account_id=?");
    if(!$stmt){
        printf("Query Prep 1 Failed: %s\n", $mysqli->error);
        exit;
    }
                
    $stmt->bind_param('ss', $accound_id, $story_id);
    $stmt->execute();
    $stmt->bind_result($found);
    $stmt->fetch();
    $stmt->close();
    return $found;
}

?>
