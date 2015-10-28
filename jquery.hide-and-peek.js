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

$.widget("jnb.hide_and_peek", {

    // Default options.
    options: {
        peek_offset: -10,
        peek_position: "bottom",
        default_shown: true,
        peek_show_duration: 1000,
        peek_hide_duration: 1000,
        center: true,
        events: {}
    },
    _create: function () {
        $(this.element).css({
                position: "absolute"
            }
        );

        if (this.options.center) {
            this._centerPeekElement();
            $(window).resize(function () {
                this._centerPeekElement();
            });
        }

        if (this.options.default_shown) {
            this.show(0);
        } else {
            this.hide(0);
        }

        if (this.options.peek_position == "bottom" || this.options.peek_position == "right") {
            this._wrapPeekElement();
        }

        if (typeof this.options.events.click === "function") {
            this.element.click(this.options.events.click);
        }
    },
    _wrapPeekElement: function () {
        var jqPeekWrapper = $("<div id='{0}' style='position:absolute; overflow: hidden;'></div>"
            .format(this.element.attr("id") + "-wrapper"));
        var jqPeekElement = this.element;
        var objWrapperCSS = {};
        if (this.options.peek_position == "bottom") {
            objWrapperCSS = {
                width: parseInt(jqPeekElement.width()),
                height: parseInt(jqPeekElement.height()),
                left: jqPeekElement.css("left"),
                bottom: 0
            };
        } else if (this.options.peek_position == "right") {
            objWrapperCSS = {
                width: parseInt(jqPeekElement.width()),
                height: parseInt(jqPeekElement.height()),
                top: jqPeekElement.css("top"),
                right: 0
            };
        }
        jqPeekElement = this.element.detach();

        jqPeekWrapper.append(jqPeekElement);

        jqPeekWrapper.css(objWrapperCSS);

        jqPeekElement.css({
            left: "",
            bottom: "",
            right: "",
            top: ""
        });
        $("body").append(jqPeekWrapper);
    },
    _centerPeekElement: function () {
        var jqPeekElement = this.element;

        if (this.options.peek_position == "top" || this.options.peek_position == "bottom") {
            //center horizontally
            var intPeekWidth = parseInt(jqPeekElement.width());
            var intWindowWidth = this._getWindowSize().width;
            jqPeekElement.css({
                "left": parseInt((intWindowWidth / 2) - (intPeekWidth / 2))
            });
        } else if (this.options.peek_position == "left" || this.options.peek_position == "right") {
            //center vertically
            var intPeekHeight = parseInt(jqPeekElement.height());
            var intWindowHeight = this._getWindowSize().height;
            jqPeekElement.css({
                "top": parseInt((intWindowHeight / 2) - (intPeekHeight / 2))
            });
        }
    },
    _getPeekDepth: function () {
        var jqPeekElement = this.element;
        var intPeekDepth;

        if (this.options.peek_position == "top" || this.options.peek_position == "bottom") {
            intPeekDepth = parseInt(jqPeekElement.height());
        } else if (this.options.peek_position == "left" || this.options.peek_position == "right") {
            intPeekDepth = parseInt(jqPeekElement.width());
        }

        if (typeof this.options.peek_offset != "undefined" && this.options.peek_offset != 0) {
            intPeekDepth += this.options.peek_offset;
        }
        return intPeekDepth;
    },
    _getHiddenOffset: function () {
        var intOffset = 0;
        switch (this.options.peek_position) {
            case "top":
                intOffset = (-1 * this._getPeekDepth());
                break;
            case "bottom":
                intOffset = (-1 * this._getPeekDepth());
                break;
            case "left":
                intOffset = (0 - this._getPeekDepth());
                break;
            case "right":
                intOffset = (0 - this._getPeekDepth());
                break;
        }
        return intOffset;
    },
    _getShownOffset: function () {
        var intOffset = 0;
        switch (this.options.peek_position) {
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
    },
    _isPeekElementVisible: function () {
        //Not sure I like this...
        return this.element.data("hidden") == "false";
    },
    _getWindowSize: function () {
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
    },
    hide: function (duration) {
        var intDuration = typeof duration === "undefined"? this.options.peek_hide_duration:duration;
        var jqPeekElement = this.element;
        var objAnimate = {}; //Cant use computed keys till ES2015 adopted
        objAnimate[this.options.peek_position] = this._getHiddenOffset() + "px";
        jqPeekElement.animate(objAnimate, intDuration);
        jqPeekElement.data("hidden", "true");
        if (typeof this.options.events.close === "function") {
            this.options.events.close();
        }
    },
    show: function (duration) {
        var intDuration = typeof duration === "undefined"? this.options.peek_show_duration:duration;
        var jqPeekElement = this.element;
        var objAnimate = {}; //Cant use computed keys till ES2015 adopted
        objAnimate[this.options.peek_position] = this._getShownOffset() + "px";
        jqPeekElement.animate(objAnimate, intDuration);
        jqPeekElement.data("hidden", "false");
        if (typeof this.options.events.open === "function") {
            this.options.events.open();
        }
    },
    toggle: function(duration){
        if(this._isPeekElementVisible()){
            this.hide(duration);
        }else{
            this.show(duration);
        }
    }
});





