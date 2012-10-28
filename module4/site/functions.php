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
	$regex1 = "/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|";
	$regex2 = "[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|";
	$regex3 = "(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|";
	$regex4 = "[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))/i";

	return preg_replace($regex1.$regex2.$regex3.$regex4, '<a href="${1}">${1}</a>', $content);
}

function is_color($color) {
	$regex = "/^([0-9]|[A-F]){6}$/";

	return preg_match($regex, $color) === 1;
}

function is_date($date, $hour, $min) {
	$regex_date = "/^([0-9]{2}\/){2}[0-9]{4}$/";
	$regex_hour = "/^([0-1][0-9])|([2][0-3])$/";
	$regex_min = "/^[0-5][0-9]$/";
	
	$bool_date = preg_match($regex_date, $date) === 1;
	$bool_hour= preg_match($regex_hour, $hour) === 1;
	$bool_min= preg_match($regex_min, $min) === 1;
	
	if( ( preg_match($regex_date, $date) === 1 ) && ( preg_match($regex_hour, $hour) === 1 ) && ( preg_match($regex_min, $min) === 1 ) ) {
		$split_date = explode("/", $date);
		return $split_date[2]."-".$split_date[0]."-".$split_date[1]." ".$hour.":".$min;
	}
	
	return false;
}

function process_text($text) {
    return htmlentities($text);
  //  return htmlentities(mb_convert_encoding($text, 'UTF-8', 'UTF-8'));
}

?>
