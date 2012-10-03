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
?>
