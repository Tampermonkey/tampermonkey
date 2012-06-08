<?php

$file = "fire.json.gz";
$params = $_POST;

if (empty($params)) {
    $params = $_GET;
}

if ($params["db_version"]) {
    $ft = filemtime($file);
    print('{ "db_version" : "' . $ft . '" }');
} else {
    if(ini_get('zlib.output_compression')) 
        ini_set('zlib.output_compression', 'Off');
    
    header("Pragma: public"); // required 
    header("Expires: 0"); 
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
    header("Cache-Control: private",false); // required for certain browsers 
# header("Content-Type: application/zip");
    header('Content-Encoding: gzip');
# header("Content-Transfer-Encoding: binary"); 
    header("Content-Length: " . filesize($file) );

    ob_clean(); 
    flush(); 
    readfile($file);
}

?>