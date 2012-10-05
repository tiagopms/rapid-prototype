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

function keep_x_lines($str, $num=3) {
    $lines = explode("\n", $str);
    $firsts = array_slice($lines, 0, $num);
    return implode("\n", $firsts);
}

function detect_links($content) {
	return preg_replace('/\s((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.\/]+\.[a-zA-Z\/]{2,3}(\/\S*)?)/', '<a href="${1}">${1}</a>', $content);
}

?>
