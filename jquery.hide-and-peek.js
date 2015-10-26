/**
 * Created by James Barnes
 * Hide and Peek is a simple jQuery plugin that allows
 * easy "peeking" for page elements.
 * Typically a toolbar or similar.
 */

var oOptions = {
    peek_selector: "#peek-element",
    position: "right",
    default_shown: true,
    center: true
};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)}/g, function (m, n) {
        return args[n];
    });
};

function init(){
    $(oOptions.peek_selector).css({
            position: "absolute"
        }
    );


    if(oOptions.center){
        centerPeekElement();
    }

    if(oOptions.default_shown){
        showPeekElement(0);
    }else{
        hidePeekElement(0);
    }

    if(oOptions.position == "bottom" || oOptions.position == "right"){
        wrapPeekElement();
    }
}

/**
 * Wraps peek element in another div to allow it to be hidden off screen without extending the
 * height of the page.
 */
function wrapPeekElement(){
    var jqPeekWrapper = $("<div id='{0}' style='position:absolute; overflow: hidden;'></div>"
        .format(oOptions.peek_selector.replace("#", "")+"-wrapper"));
    var jqPeekElement = $(oOptions.peek_selector);
    var objWrapperCSS= {};
    if(oOptions.position == "bottom"){
        objWrapperCSS = {
            width: parseInt(jqPeekElement.width()),
            height: parseInt(jqPeekElement.height()),
            left: jqPeekElement.css("left"),
            bottom: 0
        };
    }else if(oOptions.position == "right"){
        objWrapperCSS = {
            width: parseInt(jqPeekElement.width()),
            height: parseInt(jqPeekElement.height()),
            top: jqPeekElement.css("top"),
            right: 0
        };
    }

    jqPeekElement = $(oOptions.peek_selector).detach();

    jqPeekWrapper.append(jqPeekElement);

    jqPeekWrapper.css(objWrapperCSS);

    jqPeekElement.css({
        left: "",
        bottom: "",
        right:"",
        top: ""
    });
    $("body").append(jqPeekWrapper);
}

function centerPeekElement() {
    var jqPeekElement = $(oOptions.peek_selector);

   if(oOptions.position == "top" || oOptions.position == "bottom"){
       //center horizontally
       var intPeekWidth = parseInt(jqPeekElement.width());
       var intWindowWidth = getWindowSize().width;
       jqPeekElement.css({
           "left": parseInt((intWindowWidth / 2) - (intPeekWidth / 2))
       });
   }else if(oOptions.position == "left" || oOptions.position == "right") {
       //center vertically
       var intPeekHeight = parseInt(jqPeekElement.height());
       var intWindowHeight = getWindowSize().height;
       jqPeekElement.css({
           "top": parseInt((intWindowHeight / 2) - (intPeekHeight / 2))
       });
   }

}

function hidePeekElement(intDuration) {
    var jqPeekElement = $(oOptions.peek_selector);
    var objAnimate = {}; //Cant use computed keys till ES2015 adopted
    objAnimate[oOptions.position] = getHiddenOffset() + "px";
    jqPeekElement.animate(objAnimate, intDuration);
    jqPeekElement.data("hidden", "true");
}

function showPeekElement(intDuration) {
    var jqPeekElement = $(oOptions.peek_selector);
    var objAnimate = {}; //Cant use computed keys till ES2015 adopted
    objAnimate[oOptions.position] = getShownOffset() + "px";
    jqPeekElement.animate(objAnimate, intDuration);
    jqPeekElement.data("hidden", "false");
}

function getPeekDepth(){
    var jqPeekElement = $(oOptions.peek_selector);
    var intPeekDepth;

    if(oOptions.position == "top" || oOptions.position == "bottom"){
        intPeekDepth = parseInt(jqPeekElement.height());
    }else if(oOptions.position == "left" || oOptions.position == "right"){
        intPeekDepth = parseInt(jqPeekElement.width());
    }

    return intPeekDepth;
}

function togglePeekIcons() {
    $("#peek-tab").find("> img.peek-icon").each(function () {
        $(this).toggle();
    });
}

/**
 * Get offset required to hide element off screen using position
 */
function getHiddenOffset(){
    var intOffset = 0;
    switch (oOptions.position){
        case "top":
            intOffset = (-1 * getPeekDepth());
            break;
        case "bottom":
            intOffset = (-1 * getPeekDepth());
            break;
        case "left":
            intOffset = (0 - getPeekDepth());
            break;
        case "right":
            intOffset = (0 - getPeekDepth());
            break;
    }
    return intOffset;
}

function getShownOffset(){
    var intOffset = 0;
    switch (oOptions.position){
        case "top":
            intOffset = 0;
            break;
        case "bottom":
            intOffset = 0;
            break;
        case "left":
            intOffset = 0;
            break;
        case "right":
            intOffset = 0;
            break;
    }
    return intOffset;
}

function isPeekElementVisible(){
    //Not sure I like this...
    return $(oOptions.peek_selector).data("hidden") == "false";
}

/**
 * Returns object representing the size of the window
 * @returns {{width: Number, height: Number}}
 */
function getWindowSize() {
    var intViewportWidth;
    var intViewportHeight;
    try {
        intViewportHeight = $(window).height();
        intViewportWidth = $(window).width();
    } catch (ex) {
        // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight

        if (typeof window.innerWidth != 'undefined') {
            intViewportWidth = window.innerWidth;
            intViewportHeight = window.innerHeight;
        }

        // IE6 in standards compliant mode (i.e. with a valid doc type as the first line in the document)

        else if (typeof document.documentElement != 'undefined' &&
            typeof document.documentElement.clientWidth !=
            'undefined' &&
            document.documentElement.clientWidth != 0) {
            intViewportWidth = document.documentElement.clientWidth;
            intViewportHeight = document.documentElement.clientHeight;
        }

        // older versions of IE

        else {
            intViewportWidth = document.getElementsByTagName('body')[0].clientWidth;
            intViewportHeight = document.getElementsByTagName('body')[0].clientHeight;
        }
    }

    return {
        "width": parseInt(intViewportWidth),
        "height": parseInt(intViewportHeight)
    };
}