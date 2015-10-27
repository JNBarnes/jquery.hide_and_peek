/**
 * Created by James Barnes
 * Hide and Peek is a simple jQuery plugin that allows
 * easy "peeking" for page elements.
 * Typically a toolbar or similar.
 */

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)}/g, function (m, n) {
        return args[n];
    });
};

(function( $ ) {

    // Plugin definition.
    $.fn.hide_and_peek = function(action,  options ) {

        $.fn.hide_and_peek.defaults = {
            peek_offset: -10,
            peek_position: "bottom",
            default_shown: true,
            peek_show_duration:1000,
            peek_hide_duration:1000,
            center: true
        };

        $.fn.hide_and_peek.custom = function(){
            if(typeof options === "undefined"){
                return $.fn.hide_and_peek.custom;
            }else{
                return $.fn.extend($.fn.hide_and_peek.custom,options);
            }
        }();

        var oOptions = $.fn.extend({}, $.fn.hide_and_peek.defaults, $.fn.hide_and_peek.custom);

        oOptions.peek_element = this;

        switch (action){
            case "init":
                init();
                break;
            case "show":
                showPeekElement(oOptions.peek_show_duration);
                break;
            case "hide":
                hidePeekElement(oOptions.peek_hide_duration);
                break;
            case "toggle":
                if(isPeekElementVisible()){
                    hidePeekElement(oOptions.peek_hide_duration);
                }else{
                    showPeekElement(oOptions.peek_show_duration);
                }
                break;
            default:
                init(options);
        }



        function init(){

            $(oOptions.peek_element).css({
                    position: "absolute"
                }
            );


            if(oOptions.center){
                centerPeekElement();
                $(window).resize(function (){
                    centerPeekElement();
                });
            }

            if(oOptions.default_shown){
                showPeekElement(0);
            }else{
                hidePeekElement(0);
            }

            if(oOptions.peek_position == "bottom" || oOptions.peek_position == "right"){
                wrapPeekElement();
            }
        }

        /**
         * Wraps peek element in another div to allow it to be hidden off screen without extending the
         * height of the page.
         */
        function wrapPeekElement(){
            var jqPeekWrapper = $("<div id='{0}' style='position:absolute; overflow: hidden;'></div>"
                .format(oOptions.peek_element.attr("id")+"-wrapper"));
            var jqPeekElement = oOptions.peek_element;
            var objWrapperCSS= {};
            if(oOptions.peek_position == "bottom"){
                objWrapperCSS = {
                    width: parseInt(jqPeekElement.width()),
                    height: parseInt(jqPeekElement.height()),
                    left: jqPeekElement.css("left"),
                    bottom: 0
                };
            }else if(oOptions.peek_position == "right"){
                objWrapperCSS = {
                    width: parseInt(jqPeekElement.width()),
                    height: parseInt(jqPeekElement.height()),
                    top: jqPeekElement.css("top"),
                    right: 0
                };
            }

            jqPeekElement = oOptions.peek_element.detach();

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
            var jqPeekElement = oOptions.peek_element;

            if(oOptions.peek_position == "top" || oOptions.peek_position == "bottom"){
                //center horizontally
                var intPeekWidth = parseInt(jqPeekElement.width());
                var intWindowWidth = getWindowSize().width;
                jqPeekElement.css({
                    "left": parseInt((intWindowWidth / 2) - (intPeekWidth / 2))
                });
            }else if(oOptions.peek_position == "left" || oOptions.peek_position == "right") {
                //center vertically
                var intPeekHeight = parseInt(jqPeekElement.height());
                var intWindowHeight = getWindowSize().height;
                jqPeekElement.css({
                    "top": parseInt((intWindowHeight / 2) - (intPeekHeight / 2))
                });
            }

        }

        function hidePeekElement(intDuration) {
            var jqPeekElement = oOptions.peek_element;
            var objAnimate = {}; //Cant use computed keys till ES2015 adopted
            objAnimate[oOptions.peek_position] = getHiddenOffset() + "px";
            jqPeekElement.animate(objAnimate, intDuration);
            jqPeekElement.data("hidden", "true");
            if(typeof oOptions.close === "function"){
                oOptions.close();
            }
        }

        function showPeekElement(intDuration) {
            var jqPeekElement = oOptions.peek_element;
            var objAnimate = {}; //Cant use computed keys till ES2015 adopted
            objAnimate[oOptions.peek_position] = getShownOffset() + "px";
            jqPeekElement.animate(objAnimate, intDuration);
            jqPeekElement.data("hidden", "false");
            if(typeof oOptions.open === "function"){
                oOptions.open();
            }
        }

        function getPeekDepth(){
            var jqPeekElement = oOptions.peek_element;
            var intPeekDepth;

            if(oOptions.peek_position == "top" || oOptions.peek_position == "bottom"){
                intPeekDepth = parseInt(jqPeekElement.height());
            }else if(oOptions.peek_position == "left" || oOptions.peek_position == "right"){
                intPeekDepth = parseInt(jqPeekElement.width());
            }

            if(typeof oOptions.peek_offset != "undefined" && oOptions.peek_offset != 0){
                intPeekDepth += oOptions.peek_offset;
            }
            return intPeekDepth;
        }

        function togglePeekIcons() {
            $("#peek-tab").find("> img.peek-icon").each(function () {
                $(this).toggle();
            });
        }

        /**
         * Get offset required to hide element off screen using peek_position
         */
        function getHiddenOffset(){
            var intOffset = 0;
            switch (oOptions.peek_position){
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
            switch (oOptions.peek_position){
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
            return oOptions.peek_element.data("hidden") == "false";
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
    };



})( jQuery );



