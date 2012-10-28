<?php
    $user_logged = true; 
    include "start.php";
    if (!$admin) {
        $data = array("error"=>array("message"=>"User isn't admin", "code"=>"16") );
        echo json_encode($data);
        exit();
    }


    if ($_POST['token'] != $_SESSION['token']) {
        $data = array("error"=>array("message"=>"Invalid request", "code"=>"16") );
        echo json_encode($data);
        exit();
    }


    if (isset($_POST['new_admin_id'])) {
        $new_admin_id = $_POST["new_admin_id"];
    
        if ($new_admin_id == "") {
            $data = array("error"=>array("message"=>"No user selected", "code"=>"16") );
            echo json_encode($data);
            exit();
        } else {
            $stmt = $mysqli->prepare("SELECT COUNT(*) FROM accounts WHERE id=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep 2 Failed: ".htmlentities($mysqli->error), "code"=>"16") );
                echo json_encode($data);
                exit;
            }

            $stmt->bind_param('s', $new_admin_id);
            $stmt->execute();
            $stmt->bind_result($found);
            $stmt->fetch();
            $stmt->close();

            if(!$found) {
                $data = array("error"=>array("message"=>"Invalid user selected", "code"=>"16") );
                echo json_encode($data);
                exit();
            }
            
            $stmt = $mysqli->prepare("UPDATE accounts SET admin='true' WHERE id=?");
            if(!$stmt){
                $data = array("error"=>array("message"=>"Query Prep 3 Failed: ".htmlentities($mysqli->error), "code"=>"16") );
                echo json_encode($data);
                exit;
            }
            
            $stmt->bind_param('s', $new_admin_id);
            $stmt->execute();
            $stmt->close();
            
            $data = array("error"=>"null");
            echo json_encode($data);
            exit();
        }
    }

    $data = array("error"=>array("message"=>"Invalid attempt", "code"=>"16") );
    echo json_encode($data);
    exit(); 
?>
