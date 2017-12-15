//requestVars start
/*
 * @author      Jesse Berman
 * @copyright   2008-01-31
 * @version     1.0
 * @license     http://www.gnu.org/copyleft/lesser.html
*/
/*
 * Portions by Dieter Raber <dieter@dieterraber.net>
 * copyright   2004-12-27
*/

/* pwa.js: a drop-in JavaScript utility that displays galleries from picasaweb.google.com in your website */

/* This JavaScript file, when called from a webpage, will load all the thumbnail images of all the galleries
   in a user's Picasa Web Albums account into an HTML table that's 4 rows wide.  Clicking on any of the
   galleries will display thumbnails of all the photos in that gallery, and clicking on any of those thumbnails
   will display the photo.  

   To call this file from your own webpage, use the following syntax:

       <script type="text/javascript">username='YourPicasawebUsername'; photosize='800'; columns='4';</script>
       <script type="text/javascript" src="http://www.yoursite.com/pwa.js"></script>

   Make sure you change YourPicasawebUsername to your actual Picasaweb username.  For more information about
   Picasa, check out picasaweb.google.com.  Also, www.yoursite.com should point to your actual site name, and
   the location of the pwa.js file.  The script looks for the images back.jpg, next.jpg, and home.jpg, in the
   same directory as pwa.js, to create the navigation arrows.  Please make sure those exist!  I'm providing
   samples in the SourceForce repository, but feel free to substitute your own.

   Note: "Photosize" is the size of the image to be displayed when viewing single images.  I like 800.  :-)
   Note: "columns" is the number of columns of photos to be displayed on your site in the gallery and album views.
   You may omit either of these values; if you do, the default settings are 800 for photosize and 4 for columns.

*/

// $("<link href='template.css' rel='stylesheet' type='text/css' />");

function readGet(){var _GET = new Array();var uriStr  = window.location.href.replace(/&amp;/g, '&');var paraArr, paraSplit;if(uriStr.indexOf('?') > -1){var uriArr  = uriStr.split('?');var paraStr = uriArr[1];}else{return _GET;}if(paraStr.indexOf('&') > -1){paraArr = paraStr.split('&');}else{paraArr = new Array(paraStr);}for(var i = 0; i < paraArr.length; i++){paraArr[i] = paraArr[i].indexOf('=') > -1 ? paraArr[i] : paraArr[i] + '=';paraSplit  = paraArr[i].split('=');_GET[paraSplit[0]] = decodeURI(paraSplit[1].replace(/\+/g, ' '));}return _GET;}var _GET = readGet();
//requestVars end

//$Update: May 10, 2007$

function $(a){document.write(a);}
var photosize;
if(!photosize){photosize = 1024;}

var columns;
if(!columns || isNaN(columns) || columns < 1) {columns = 4;}

//Global variables
var photolist = new Array(); //this is used globally to store the entire list of photos in a given album, rather than pass the list around in a URL (which was getting rediculously long as a result)
var album_name = ""; //this is used globally to store the album name, so we don't have to pass it around in the URL anymore either.
var my_numpics = ""; //this is used globally to store the number of items in a particular album, so we don't have to pass it around in the URL anymore either.
var prev = ""; //used in the navigation arrows when viewing a single item
var next = "";//used in the navigation arrows when viewing a single item

function picasaweb(j){ //returns the list of all albums for the user

 $("<div id='container'>");
 
 $("<div id='title'>Gallery Home</div>");
 
 //  $("<div id='title'>Gallery Home <a target=PICASA href='http://picasaweb.google.com/"+username+"/'>on picasa web</a></div>");
 
 //$("<div id='description'>This page displays all public albums on Picasa Web Albums of one Picasa user. Public visibility of each album can be toggled on and off in the Picasa Web Albums settings.</div>");
 //$("<div id='description'>James Byun's Gallery</div>");
 
 $("<div id='gallerycontainer'>");
 
 for(i=0;i<j.feed.entry.length;i++){

 // for each of the albums in the feed, grab its album cover thumbnail and the link to that album,
 // then display them in a table with 4 columns (along with the album title)

  var img_base = j.feed.entry[i].media$group.media$content[0].url;

  var id_begin = j.feed.entry[i].id.$t.indexOf('albumid/')+8;
  var id_end = j.feed.entry[i].id.$t.indexOf('?');
  var id_base = j.feed.entry[i].id.$t.slice(id_begin, id_end);

// crop = 1 is crop to square
// crop = 0 do not crop

 $("<div class='thumbnail' ><a href='?albumid="+id_base+"'><img width='150' src='"+img_base+"?imgmax=160&crop=1' /></a>");
 // $("<td valign=top><a class='standard' href='?albumid="+id_base+"'><img src='"+img_base+"?imgmax=160&crop=0' class='pwimages' /></a>");
  //$("</br><a href='?albumid="+id_base+"'>"+ j.feed.entry[i].title.$t +"</a></div>");
  $("<a href='?albumid="+id_base+"'>"+ j.feed.entry[i].title.$t +"</a></div>");
 // if (i % columns == columns-1) {
 //   $("");
 // }
 }
// $("");
 $("</div id='gallerycontainer'>");
 $("</div id='container'>");

}

function getphotolist(j){

// This function is called just before displaying an item; it returns info about the item's current state within its parent
// album, such as the name of the album it's in, the index of the photo in that album, and the IDs of the previous and next
// photos in that album (so we can link to them using navigation arrows).  This way we don't have to pass state information
// around in the URL, which was resulting in hellishly long URLs (sometimes causing "URI too long" errors on some servers).

// Get the number of pictures in the album.  Added 7/18/2007.
 my_numpics = j.feed.openSearch$totalResults.$t;

// Also get the name of the album, so we don't have to pass that around either.  Added 7/18/2007.
 album_name = j.feed.title.$t;

 for(i=0;i<j.feed.entry.length;i++){
  // get the list of all photos referenced in the album and display;
  // also stored in an array (photoids) for navigation in the photo view (passed via the URL)
  var id_begin = j.feed.entry[i].id.$t.indexOf('photoid/')+8;
  var id_end = j.feed.entry[i].id.$t.indexOf('?');
  var id_base = j.feed.entry[i].id.$t.slice(id_begin, id_end);
  photolist[i]=id_base;

  // now get previous and next photos relative to the photo we're currently viewing
  if (i>0)
  {
    var prev_begin = j.feed.entry[i-1].id.$t.indexOf('photoid/')+8;
    var prev_end = j.feed.entry[i-1].id.$t.indexOf('?');
    prev = j.feed.entry[i-1].id.$t.slice(id_begin, id_end);
  }
  if (i<j.feed.entry.length-1)
  {
    var next_begin = j.feed.entry[i+1].id.$t.indexOf('photoid/')+8;
    var next_end = j.feed.entry[i+1].id.$t.indexOf('?');
    next = j.feed.entry[i+1].id.$t.slice(id_begin, id_end);
  }

 }
}


function albums(j){  //returns all photos in a specific album

 //get the number of photos in the album
 var np = j.feed.openSearch$totalResults.$t;
 var item_plural = "s";
 if (np == "1") { item_plural = ""; }

 var album_begin = j.feed.entry[0].summary.$t.indexOf('href="')+6;
 var album_end = j.feed.entry[0].summary.$t.indexOf('/photo#');
 var album_link = j.feed.entry[0].summary.$t.slice(album_begin, album_end);
 var photoids = new Array();


$("<div id='container'>");
 //$("<div id='title'><a  href='" + window.location.protocol + "//" + window.location.hostname+window.location.pathname+"'>Gallery Home</a> &gt; "+ j.feed.title.$t +"&nbsp;&nbsp;["+np+" item"+item_plural+"] </div>");
 $("<div id='title'><a  href='" + window.location.protocol + "//" + window.location.hostname+window.location.pathname+"'>Gallery Home</a> &gt; "+ j.feed.title.$t +"&nbsp;&nbsp;["+np+" image"+item_plural+"] </div>");
 //$("<div id='description'>This page displays all images in one album on Picasa Web Albums of one Picasa user. Public visibility of each album can be toggled on and off in the Picasa Web Albums settings.</div>");
 //$("<div id='description'>"+j.feed.subtitle.$t+"</div>");
 if ( j.feed.subtitle.$t != "" )
   { $("<div id='description'>"+j.feed.subtitle.$t+"</div>"); }

 
$("<div id='gallerycontainer'>");


 for(i=0;i<j.feed.entry.length;i++){

  //var img_begin = j.feed.entry[i].summary.$t.indexOf('src="')+5;
  //var img_end = j.feed.entry[i].summary.$t.indexOf('?imgmax');
  //var img_base = j.feed.entry[i].summary.$t.slice(img_begin, img_end);

  var img_base = j.feed.entry[i].media$group.media$content[0].url;

  var id_begin = j.feed.entry[i].id.$t.indexOf('photoid/')+8;
  var id_end = j.feed.entry[i].id.$t.indexOf('?');
  var id_base = j.feed.entry[i].id.$t.slice(id_begin, id_end);
  photoids[i]=id_base;
  

  // display the thumbnail and make the link to the photo page, including the gallery name so it can be displayed.
  // (apparently the gallery name isn't in the photo feed from the Picasa API, so we need to pass it as an argument in the URL) - removed the gallery name 7/18/2007
  var link_url = "?albumid="+_GET['albumid']+"&photoid="+id_base; //+"&photoids="+photoids;
  // disable the navigation entirely for really long URLs so we don't hit against the URL length limit.
  // note: this is probably not necessary now that we're no longer passing the photoarray inside the URL. 7/17/2007
  // Not a bad idea to leave it in, though, in case something goes seriously wrong and we need to revert to that method.
  
  // if (link_url.length > 2048) { link_url = link_url.slice(0, link_url.indexOf('&photoids=')+10)+id_base; }
  //$("<div class='thumbnail'><a href='"+link_url+"'><img width='150' src='"+img_base+"?imgmax=160&crop=1'  /></a> </div>");
  //$("<br />"+j.feed.entry[i].media$group.media$description.$t+" ");
  // $("");

  $("<div class='thumbnail'><a href='"+link_url+"'><img width='150' src='"+img_base+"?imgmax=160&crop=1'  /></a>");
  $(""+j.feed.entry[i].media$group.media$title.$t+" </div>");

 // if (i % columns == columns-1) {
 //   $("");
 // }
 } 
$("</div id='gallerycontainer'>");
$("</div id='container'>");

}


function photo(j){//returns exactly one photo


 var album_begin = j.entry.summary.$t.indexOf('href="')+6;
 var album_end = j.entry.summary.$t.indexOf('/photo#');
 var album_link = j.entry.summary.$t.slice(album_begin, album_end);

 var img_title = j.entry.title.$t;

 //get the dimensions of the photo we're grabbing; if it's smaller than our max width, there's no need to scale it up.
 var img_width = j.entry.media$group.media$content[0].width;
 var img_height = j.entry.media$group.media$content[0].height;

 var img_base = j.entry.media$group.media$content[0].url;


 // is this a video? If so, we will display that in the breadcrumbs below.
 var is_video = 0;
 if (j.entry.media$group.media$content.length > 1)
 {
   //$('This is a '+j.entry.media$group.media$content[1].medium+'.<br>');
   if (j.entry.media$group.media$content[1].medium == "video")
   {
	   is_video = 1;
   }
 }

 
 var photo_begin = j.entry.summary.$t.indexOf('href="')+6;
 var photo_end = j.entry.summary.$t.indexOf('"><img');
 var photo_link = j.entry.summary.$t.slice(photo_begin, photo_end);
 var photo_id = _GET['photoid'];

 var album_id = _GET['albumid'];
 var my_next = next;
 var my_prev = prev;
 var photo_array = photolist;

 var my_galleryname = album_name;
 var my_fixed_galleryname = album_name;
 var album_base_path = window.location.protocol + "//" + window.location.hostname+window.location.pathname +"?albumid="+ _GET['albumid'];

 // Get the filename for display in the breadcrumbs
 var LastSlash = 0;
 var img_filename = img_title;
 for(i=0;i<img_base.length-1;i++){
  if (img_base.charAt(i)=="/")
  {
	  LastSlash = i;
  }
 }
 if (LastSlash != 0)
 {
	 img_filename = img_base.slice(LastSlash+1, img_base.length);
 }
 // replace some commonly-used URL characters like %20
 img_filename = img_filename.replace("%20"," ");
 img_filename = img_filename.replace("%22","\"");
 img_filename = img_filename.replace("%27","\'");


//find preceding two and following two pictures in the array; used for the navigation arrows.
//the arrows are already linked to the previous and next pics, which were passed in with the URL.
//however, we need the ones that are two behind and two ahead so that we can pass that info along when we link to another photo.
//
//NOTE: as of 7/16/2007, the photo array is taken from global photolist (loaded in the getphotolist function) rather than from the URL.
//This has eliminated the need for really long URLs, which were hitting up against the URL length limit in some extreme cases.
for(i=0;i<photo_array.length;i++){
 if (photo_array[i]==photo_id)
 {
	 var p1 = photo_array[i-1]; //ID of the picture one behind this one; if null, we're at the beginning of the album
	 var current_index = i + 1; //this is the count of the current photo
	 var n1 = photo_array[i+1]; //ID of the picture one ahead of this one; if null, we're at the end of the album
 }
}
//these will be passed along if we move to the next or previous photo - removed the gallery name 7/18/2007
//var prev = album_base_path + "&photoid=" + p1 + "&np=" + my_numpics + "&galleryname=" + my_galleryname.replace("'","%27") + "&prev="+p2+ "&next="+photo_id; //+"&photoids="+photo_array;
//var next = album_base_path + "&photoid=" + n1 + "&np=" + my_numpics + "&galleryname=" + my_galleryname.replace("'","%27") + "&prev="+photo_id+ "&next="+n2; //+"&photoids="+photo_array;
var prev = album_base_path + "&photoid=" + p1; //+"&photoids="+photo_array;
var next = album_base_path + "&photoid=" + n1; //+"&photoids="+photo_array;


//Display the breadcrumbs
var my_item_plural = "";
if (my_numpics != 1)
{
	my_item_plural = "s";
}
//var item_label = "picture";
//var item_label_caps = "Picture";
var item_label = "image";
var item_label_caps = "Image";
if (is_video == 1) //if it's a video, don't say it's a picture, say it's an "item" instead
{
	item_label = "item";
	item_label_caps = "Item";
}
//if (photo_array.length == 1) { var current_index_text = "Total of " + my_numpics + " " + item_label + my_item_plural; } else { var current_index_text = item_label_caps + " " + current_index + " of " + my_numpics; }
//var current_index_text = item_label_caps + " " + current_index + " of " + my_numpics;
var current_index_text = item_label_caps + " " + current_index + "/" + my_numpics;
if (is_video == 1) { current_index_text = current_index_text + "&nbsp;&nbsp;[VIDEO]"; }  //show in the breadcrumbs that the item is a video

 $("<div id='container'>");
  $("<div id='title'><a href='"+ window.location.protocol + "//" + window.location.hostname+window.location.pathname+"'>Gallery Home</a> &gt; <a href='" + album_base_path + "' > " + my_fixed_galleryname + "</a> &gt; <!--" + img_filename + "-->" + current_index_text + "</div>");

if (p1 == null) //we're at the first picture in the album; going back takes us to the album index
  { var prev = album_base_path }

if (n1 == null) //we're at the last picture in the album; going forward takes us to the album index
  { var next = album_base_path }

 $("<div id='navigation'>");
	if (photo_array.length > 1) { $("<a class='standard' href='"+prev+"'> Previous Item </a>&nbsp; &nbsp;"); }
 	$("&nbsp; &nbsp;<a href='"+album_base_path+"'>Back to Album</a>&nbsp; &nbsp;");
	 if (photo_array.length > 1) { $("&nbsp; &nbsp;<a href='"+next+"'>Next Item</a> "); }
 $("</div> ");
 

// $("<div><a href='"+ window.location.protocol + "//" + window.location.hostname+window.location.pathname+"'>Gallery Home</a> &gt; <a href='" + album_base_path + "'>" + my_fixed_galleryname + "</a> &gt; <!--" + img_filename + "-->" + current_index_text + "</div><div style='text-align:right; margin-right:3px; margin-top:-14px'><a target=PICASA class='standard' href='"+photo_link+"'>...</a></div><br>");


 //the navigation panel: back, home, and next.
// $("<center><table border=0><tr valign=top>");
 //if (photo_array.length > 1) { $("<a class='standard' href='"+prev+"'>Previous Item</a> "); }
 //$("<a href='"+album_base_path+"'>Back to Album</a>");
 //if (photo_array.length > 1) { $("<a href='"+next+"'>Next Item</a>"); }
 // $("</tr></table></center><br>");

 //var max_width = 800; //max display width for our photos
 var max_width = 1024; //max display width for our photos
 var max_height = 682;
 var display_width = max_width;
 //if (img_width < display_width)
 //  { display_width = img_width; } //don't scale up photos that are narrower than our max width; disable this to set all photos to max width
 if (img_height > img_width)
   { display_width = max_height; }

 //at long last, display the image and its description. photos larger than max_width are scaled down; smaller ones are left alone

// code with link to picasa web 
// $("<center><a border=0 target=PICASA href='"+photo_link+"'><img id='picture' width="+display_width+" src='"+img_base+"?imgmax="+photosize+"' class='ppwimages' /></a></center>");
// code without this link
$("<center><img id='picture' width="+display_width+" src='"+img_base+"?imgmax="+photosize+"' /></center>");
//$("<br><center><div>"+j.entry.media$group.media$description.$t+"</div></center></p>");
//$("<br><center><div>"+j.entry.media$group.media$title.$t+"</div></center></p>");
if( j.entry.media$group.media$description.$t == "" )
  { $("<br><center><div>"+j.entry.media$group.media$title.$t+"</div></center></p>"); }
else
  { $("<br><center><div>"+j.entry.media$group.media$description.$t+"</center></p>");
    $("<center>"+j.entry.media$group.media$title.$t+"</div></center></p>"); }
//$("<br><center><div>"+j.entry.exif$tags.exif$make.$t+"</div></center></p>");

 //now we will trap left and right arrow keys so we can scroll through the photos with a single keypress ;-) JMB 7/5/2007
 $('<script language="Javascript"> function testKeyCode( evt, intKeyCode ) { if ( window.createPopup ) return evt.keyCode == intKeyCode; else return evt.which == intKeyCode; } document.onkeydown = function ( evt ) { if ( evt == null ) evt = event; if ( testKeyCode( evt, 37 ) ) { window.location = "' + prev + '"; return false; } if ( testKeyCode( evt, 39 ) ) { window.location = "' + next + '"; return false; } } </script>');

}

if(_GET['photoid']&&_GET['albumid']){

 //$('<script type="text/javascript" src="http://picasaweb.google.com/data/feed/base/user/'+username+'/albumid/'+_GET['albumid']+'?category=photo&alt=json&callback=getphotolist"></script>');//get the list of photos in the album and put it in the global "photolist" array so we can properly display the navigation arrows; this eliminates the need for really long URLs :-) 7/16/2007
 $('<script type="text/javascript" src="https://picasaweb.google.com/data/feed/base/user/'+username+'/albumid/'+_GET['albumid']+'?category=photo&alt=json&callback=getphotolist"></script>');//get the list of photos in the album and put it in the global "photolist" array so we can properly display the navigation arrows; this eliminates the need for really long URLs :-) 2017-12-15
 //$('http://picasaweb.google.com/data/entry/base/user/'+username+'/albumid/'+_GET['albumid']+'/photoid/'+_GET['photoid']+'?alt=json&callback=photo&np='+_GET['np']+'&galleryname='+_GET['galleryname']);
 //$('<script type="text/javascript" src="http://picasaweb.google.com/data/entry/base/user/'+username+'/albumid/'+_GET['albumid']+'/photoid/'+_GET['photoid']+'?alt=json&callback=photo"></script>');//photo
 $('<script type="text/javascript" src="https://picasaweb.google.com/data/entry/base/user/'+username+'/albumid/'+_GET['albumid']+'/photoid/'+_GET['photoid']+'?alt=json&callback=photo"></script>');//photo

//$('<script type="text/javascript" src="http://picasaweb.google.com/data/entry/base/user/'+username+'/albumid/'+_GET['albumid']+'/photoid/'+_GET['photoid']+'?alt=json&callback=photo&np='+_GET['np']+'&galleryname='+_GET['galleryname']+'"></script>');//photo

}else if(_GET['albumid']&&!_GET['photoid']){
 //$('<script type="text/javascript" src="http://picasaweb.google.com/data/feed/base/user/'+username+'/albumid/'+_GET['albumid']+'?category=photo&alt=json&callback=albums"></script>');//albums
 $('<script type="text/javascript" src="https://picasaweb.google.com/data/feed/base/user/'+username+'/albumid/'+_GET['albumid']+'?category=photo&alt=json&callback=albums"></script>');//albums
}else{
 //$('<script type="text/javascript" src="http://picasaweb.google.com/data/feed/base/user/'+username+'?category=album&alt=json&callback=picasaweb&access=public"></script>');//picasaweb
 $('<script type="text/javascript" src="https://picasaweb.google.com/data/feed/base/user/'+username+'?category=album&alt=json&callback=picasaweb&access=public"></script>');//picasaweb
}
