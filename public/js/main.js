
$(document).ready(function () {
    $('.fancybox').fancybox();
    $('#messagebox').hide();
    loadDropdown($('#dropdown'),"sweets.json",null);
});

var videocounter = 0;


/*
 index.html
 */

// "+" Icon

$('#header_new').unbind("click").click(function(){
    $("#maincontainer").load("./maincontent_new.html");
    $("#sidebarcontainer").load("./sidebarcontent_new.html");
    $('#navicon').fadeIn(500);
    $('#avatar4navicon').fadeIn(500);
});



// Lupen-Icon
$('#header_search').unbind("click").click(function(){
    $("#maincontainer").load("./maincontent_search.html");
    $("#sidebarcontainer").load("./sidebarcontent_search.html");
    $('#navicon').fadeIn(500);
    $('#avatar4navicon').fadeIn(500);
});


/*
 maincontent HTML pages
 */

// table dimensions depend on screen dimension
$('#maincontent_table_left').css("width", (($(document).width() - 175) / 2));
$('#maincontent_table_left').css("height", ($(document).height() - 190));
$('#maincontent_table_right').css("width", (($(document).width() - 175) / 2));
$('#maincontent_table_right').css("height", ($(document).height() - 190));



// Socket.io-Verbindung
var socket = io();

/*
 validation
 */

function validateIt(textfield) {
    var insertedVal = $(textfield).val().trim();
    var dropdownSelectedItem = $("#dropdown option:selected").text();
    // does the dropdown menu include the inserted text from textfield?
    if (include(dropdownarray, insertedVal)) var match = true;
    else var match = false;
    // all strings which equal a dropdown item are forbidden except the selected one
    // and all strings which are too short, too.
    if (match == true && dropdownSelectedItem != insertedVal || insertedVal.length < 1) {
        $(textfield).css("border-color", "#db0031"); // red
        return false;
    }
    else {
        $(textfield).css("border-color", "#000"); // black
        return true;
    }
    function include(arr, obj) {
        for (var j = 0; j < arr.length; j++) {
            if (arr[j] === obj) return true;
        }
    }
}





/*
 Fill dropdown menu with data from the database
 */

function loadDropdown(dropdown, json, except, callback) {
    $.getJSON("../json/"+json, function (data) {
        $(dropdown).empty();
        dropdownarray = [];
        $.each(data, function (key, val) {        // push all data from column "description" into array and sort it by alphabet




            //var array1 = dropdownarray.push(val.description);
            //var array2 = except;




            if(val.sweets_id != except) dropdownarray.push(val.description);  // Array-Elemente in ein Array schreiben
        });
        dropdownarray.sort();

        dropdownarray.sort(function (a, b) {      // Sort regardless of upper/lower case
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        dropdownarray.unshift("Rubrik wählen"); // Am Anfang einfügen
        for (var i = 0; i < dropdownarray.length; i++) {
            $(dropdown).append("<option>" + dropdownarray[i] + "</option>");
        }
    });
    if(callback)callback();
}














/*
 Decide whether a picture or a video will be added to id="img"
 */

function pictureOrVideo(div, visual, mini) {
    // Extract file extension from file name
    dateityp = visual.trim().split('.').pop();
    // Check file extension
    if (dateityp == "jpg")fillPicture(div, visual);
    if (dateityp == "jpeg")fillPicture(div, visual);
    if (dateityp == "png")fillPicture(div, visual);
    if (dateityp == "bmp")fillPicture(div, visual);
    if (dateityp == "mp4")fillVideo(div, visual, mini);
    if (dateityp == "ogg")fillVideo(div, visual, mini);
    if (dateityp == "webm")fillVideo(div, visual, mini);
}

/*
 Add a picture to id="img"
 */

function fillPicture(div, visual) {
    var bild = '<a class="fancybox" href=\'../img/' + visual + '\' ><img src=\'../img/' + visual + '\' height="100px" /></a>';

    $(div).html(bild);
}


/*
 Add a video to id="img"
 */

function fillVideo(div, visual, mini) {

    if(mini==true){
        var video = '<video class="video-js vjs-big-play-centered" style="color:rgba(0,0,0,0);"' +
                    'width="160" height="90" ' +
                    'data-setup=\'{}\'>' +
                    '<source src="../img/' + visual + '" type="video/mp4"/>' +
                    '</video>';
    }

    else{
        var video = '<video class="video-js vjs-default-skin vjs-big-play-centered video-js-fullscreen"' +
                    'controls preload="auto" width="480" height="270" ' +
                    'autoplay ' +
                    'data-setup=\'{ "example_option": true}\'' +
                    '>' +
                    '<source src="../img/' + visual + '" type="video/mp4"/>' +
                    '</video>';
    }

    $(div).html(video);
    videojs(document.getElementsByClassName("video-js")[videocounter], {}, function () {
        // Player (this) is initialized and ready.
        this.play();
        videocounter++;
    });
}

/*
Tooltips
 */


$(".top").tooltip({
    placement: "top"
});

$(".bottom").tooltip({
    placement: "bottom"
});

$(".left").tooltip({
    placement: "left"
});

$(".right").tooltip({
    placement: "right"
});

/*
 upload-form.html
 */





<!--Upload Form-->



//document.getElementsByClassName("navicon").onclick = (function () {
//    var state = false;
//    $("#upload_file").hide();
//    return function (e) {
//        if (state == false) {
//            state = true;
//            $('#addVisual').text('No visual');
//            function makeFileUploader(callback) {
//                $("#upload_file").html('<input type="file" name="img2">');
//                callback();
//            }
//
//            makeFileUploader(function () {
//                $("#upload_file").slideDown('fast');
//            });
//        }
//        else {
//            state = false;
//            $('#addVisual').text('Add a visual');
//            $("#upload_file").slideUp('fast', function () {
//                $("#upload_file").empty();
//            });
//
//        }
//    };
//})();


