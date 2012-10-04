<h2>Categories</h2>
<ul>
	<?php
        $stmt = $mysqli->prepare("select id, name from categories");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
         
        $stmt->execute();
        $stmt->bind_result($category_id, $category_name);
         
        while($stmt->fetch()){
        	if ($user_logged) {
        		echo '<li><a href="home.php?category='.$category_id.'"> '.$category_name.' </a></li>';
        	} else {
                echo '<li><a href="login.php?category='.$category_id.'"> '.$category_name.' </a></li>';
            }
        }
        
        $stmt->close();
    ?>
    <li><a id="current" href="#"> loren ipsum </a></li>
    <li><a href="#"> loren ipsum </a></li>
    <li><a href="#"> loren ipsum </a></li>
    <li><a href="#"> loren ipsum </a></li>
</ul>