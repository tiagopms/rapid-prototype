<h2>Categories</h2>
<ul>
	<?php
        $current_category = (isset($_GET['category'])) ? $_GET['category'] : -1;
        $current_category_id = ($current_category == -1) ? ' id="current" ' : "";
        if ($user_logged) {
            echo '<li><a'.$current_category_id.htmlentities($current_category_id).' href="home.php"> All </a></li>';
        } else {
            echo '<li><a'.$current_category_id.htmlentities($current_category_id).' href="login.php"> All </a></li>';
        }
        $stmt = $mysqli->prepare("select id, name from categories");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
         
        $stmt->execute();
        $stmt->bind_result($category_id, $category_name);
         
        while($stmt->fetch()){
            $current_category_id = ($current_category == $category_id) ? ' id="current" ' : "";
        	if ($user_logged) {
        		echo '<li><a'.$current_category_id.htmlentities($current_category_id).' href="home.php?category='.htmlentities($category_id).'"> '.htmlentities($category_name).' </a></li>';
        	} else {
                echo '<li><a'.$current_category_id.htmlentities($current_category_id).' href="login.php?category='.htmlentities($category_id).'"> '.htmlentities($category_name).' </a></li>';
            }
        }
        
        $stmt->close();
    ?>
</ul>