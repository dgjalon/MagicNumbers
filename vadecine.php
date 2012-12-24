<?php
// DO NOT SHOW WARNINGS
ini_set('display_errors', 'Off');
ini_set('display_startup_errors', 'Off');
error_reporting(0);


function getUrlInfo($url){	
    $ch = curl_init();    
    curl_setopt ($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6");
    curl_setopt ($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt ($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	
    /* PROXY SETTINGS */
    $proxy_ip = "http://web-proxy.hpl.hp.com";$proxy_port="8088";
    curl_setopt($ch, CURLOPT_PROXYPORT, $proxy_port);
    curl_setopt($ch, CURLOPT_PROXYTYPE, 'HTTP');
    curl_setopt($ch, CURLOPT_PROXY, $proxy_ip);

    curl_setopt ($ch, CURLOPT_REFERER, $url);
    curl_setopt ($ch, CURLOPT_URL, $url);
    $result = curl_exec ($ch);
    return $result;
}



function getFilmsByLetter($link_letter){
    $DOM = new DOMDocument;
    $DOM->loadHTML(getUrlInfo($link_letter));
    $div = $DOM->getElementById("content-area");
    //get all links
    $items = $div->getElementsByTagName('a');
    $links = array();
    for ($i = 0; $i < $items->length; $i++){
        $pos = strpos($items->item($i)->getAttribute("href"), "/vadecine2/");
        if($pos!==FALSE){
            $links[$i]['TITLE'] = "\"". $items->item($i)->nodeValue. "\"";
            $links[$i]['LINK'] = "http://www.vadecine.es" . $items->item($i)->getAttribute("href");
        }
    }

    foreach ($links as $key => $link) {
        $link = $link['LINK'];
        $DOM = new DOMDocument;
        $DOM->loadHTML( getUrlInfo($link) );
        //$div = $DOM->getElementById("content-area");
        $xpath = new DOMXPath($DOM);
        $labels = $xpath->query('//span[@class="reviewRatingLabel"]');
        $values = $xpath->query('//span[@class="reviewRatingValue"]');
        $nota_p = $labels->item(0)->nodeValue . $values->item(0)->nodeValue;
        $nota_v = $labels->item(1)->nodeValue . $values->item(1)->nodeValue;
        print "***";
        $links[$key]['PUBLIC'] = trim( str_replace("Valoración espectadores:", "", $nota_p) );
        $links[$key]['VADECINE'] = trim( str_replace("Valoración de VaDeCine.es:", "", $nota_v) );
        print_r ($links[$key]);
        print "***\n";
    }
    return $links;
}


/*
 * EMPIEZA LA MARCHA!!
 */
$fp = fopen('data.txt', 'w');

$myLink = "http://www.vadecine.es/vadecine2/";
$links = getFilmsByLetter( $myLink."0-9" ); 

foreach ($links as $key => $link) {
    fwrite($fp, $link['TITLE'].";");
    fwrite($fp, $link['LINK'].";");
    fwrite($fp, $link['PUBLIC'].";");
    fwrite($fp, $link['VADECINE'].";\n");
}

for ($letter = ord('a'); $letter <= ord('z'); $letter++) { 
    print $myLink.chr($letter)."\n";
    $links = getFilmsByLetter( $myLink.chr($letter) ); 
    foreach ($links as $key => $link) {
        fwrite($fp, $link['TITLE'].";");
        fwrite($fp, $link['LINK'].";");
        fwrite($fp, $link['PUBLIC'].";");
        fwrite($fp, $link['VADECINE'].";\n");
    }
} 
fclose($fp);

?>
