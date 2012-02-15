/* 
* Quaid Core
* 
* Core JavaScript methods and prototyped extensions.
* 
* Version:  2.0
* Updated:  16/09/2011
* Author:   Chris Lienert
* Changes:  Revised and updated from common.js
*           Added detector for string.trim() prototype to allow native methods to take precedence
*           Added Array.forEach prototype for older clients
*           Added Autofocus, Placeholder and TextArea maxlength HTML5 attribute support fo older clients
*           Changed toJsDate method to string prototyped string.toDate() with smarter two digit year conversion
*           Changed namespaces to be consistent with JavaScript syntax i.e. quaid.Date -> quaid.date
*           Removed quaid.setOptional method. This has been replaced by $.setToggle() in quaid.forms
* 
* Requires: jQuery 1.6.x
*           Modernizr 2.x
*/
$.ajaxSettings.traditional = true; //see http://api.jquery.com/jQuery.param/

/* Prototyped core object extensions */
//restore any unsupported native methods
if (!String.prototype.trim) {
  String.prototype.trim = function() { //remove leading and trailing spaces
    return this.replace( /^\s*|\s*$/g , "");
  };
}
// Production steps of ECMA-262, Edition 5, 15.4.4.18 via https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callbackfn, thisArg) {
    var T,
      O = Object(this),
      len = O.length >>> 0,
      k = 0;

    // If no callback function or if callback is not a callable function
    if (!callbackfn || !callbackfn.call) {
      throw new TypeError();
    }

    // If the optional thisArg context param was provided,
    // Set as this context 
    if (thisArg) {
      T = thisArg;
    }

    while (k < len) {
      // Store property key string object reference
      var Pk = String(k),
      // Determine if property key is present in this object context
        kPresent = O.hasOwnProperty(Pk),
        kValue;

      if (kPresent) {
        // Dereference and store the value of this Property key
        kValue = O[Pk];

        // Invoke the callback function with call, passing arguments:
        // context, property value, property key, thisArg object context
        callbackfn.call(T, kValue, k, O);
      }
      k++;
    }
  };
}
if (!Array.indexOf) {//add Array.indexOf for older clients
  Array.prototype.indexOf = function(obj) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == obj) {
        return i;
      }
    }
    return -1;
  };
};

/* Custom protoyped extension methods */
//converts dd/mm/yyyy or dd-mm-yyyy to a Javascript date object
//Conversion of two digit years varies according to the provided birth parameter
//By default, future dates within a 20 year range will stay in the current century.
//For birth dates, future dates use the previous century
//For example in 2011:
// "12/12/11".toDate() -> 12/12/2011
// "12/12/12".toDate() -> 12/12/2012
// "12/12/40".toDate() -> 12/12/2040
// "12/12/11".toDate(birth) -> 12/12/2011
// "12/12/12".toDate(birth) -> 12/12/1912
String.prototype.toDate = function (birth) {
  if (this.length == 0) {
    return new Date();
  }
  var ar = String(this).split(/\/|-/);
  if (ar.length !== 3) {
    return new Date();
  }
  var centuryPrefix = "";
  if (ar[2].length == 2) {//two digit year provided
    if (birth) {
      centuryPrefix = (ar[2] <= String((new Date()).getFullYear()).substr(2)) //current year in two digits
      ? "20" : "19";
    } else {
      centuryPrefix = (ar[2] <= String((new Date()).getFullYear() + 20).substr(2)) //current year in two digits
        ? "20" : "19";
    }
  }
  return new Date(centuryPrefix + ar[2], ar[1] - 1, ar[0]);
};
//converts a currency string to a number. Returns 0 if the value doesn't parse
String.prototype.toNumber = function() {
  var num = parseInt(this.replace(/[\$\u20AC\u00A3\u00A6,]/g,""));
  if (isNaN(num)) {
    return 0;
  }
  return num;
};
//converts a currency string to a float. Returns 0 if the value doesn't parse
String.prototype.toFloat = function() {
  var num = parseFloat(this.replace(/[\$\u20AC\u00A3\u00A6,]/g,""));
  if (isNaN(num)) {
    return 0;
  }
  return num;
};

//converts a number to a currency format $XXX,XXX.XX
Number.prototype.toCurrency = function (symbol) {
  if (!symbol) {
    symbol = "\$";
  }
  return (String(Math.floor(this)).replace(/(?=(\d{3})+$)\B/g, ",") + String(this.toFixed(2)).substring(String(this.toFixed(2).length - 3))).replace(/(-?)/, "$1" + symbol);
};

//converts a number to a currency format $XXX,XXX
Number.prototype.toWholeCurrency = function (symbol) {
  if (!symbol) {
    symbol = "\$";
  }
  return String(Math.round(this))
  .replace(/(?=(\d{3})+$)\B/g, ",")
  .replace(/(-?)/, "$1" + symbol);
};

//Converts a number to a percentage string XX.X%
Number.prototype.toPercentage = function () {
  return Math.round(this * 100) + "%";
};

//returns the first day of the week in a month
Date.prototype.getFirstDay = function () {
  d = new Date(this);
  d.setDate(0);
  return (d.getDay() + 1) % 7;
};
//returns the last day of the month
Date.prototype.getLastDay = function () {
  d = new Date(this);
  d.setMonth(d.getMonth() + 1); //next month
  d.setDate(-1); //minus 1 day
  return (d.getDay() + 1) % 7;
};
//returns the last date of the month
Date.prototype.getLastDate = function () {
  d = new Date(this);
  d.setMonth(d.getMonth() + 1); //next month
  d.setDate(-1); //minus 1 day
  return d.getDate();
};
Date.prototype.format = function (f) {
  var d = this;
  return f.replace(/(yyyy|mmmm|mmm|mm|dddd|ddd|dd|d|hh|h|nn|ss|a\/p)/gi,
    function ($1) {
      switch ($1.toLowerCase()) {
        case 'yyyy': return d.getFullYear();
        case 'mmmm': return quaid.date.months[d.getMonth()];
        case 'mmm': return quaid.date.months[d.getMonth()].substr(0, 3);
        case 'mm': return quaid.addZero(d.getMonth() + 1);
        case 'dddd': return quaid.date.days[d.getDay()];
        case 'ddd': return quaid.date.days[d.getDay()].substr(0, 3);
        case 'dd': return quaid.addZero(d.getDate());
        case 'd': return d.getDate();
        case 'hh': return quaid.addZero((h = d.getHours() % 12) ? h : 12);
        case 'h': return (h = d.getHours() % 12) ? h : 12;
        case 'nn': return quaid.addZero(d.getMinutes());
        case 'ss': return quaid.addZero(d.getSeconds());
        case 'a/p': return d.getHours() < 12 ? 'AM' : 'PM';
      }
    }
  );
};

//Date methods
//define namespace
var quaid = {//General methods
  addZero: function (n) { //adds a leading zero to single figure integers
    return String(n).replace(/^(\d)$/, "0$1");
  },
  getCurrencySymbol: function (currency) {
    switch (currency) {
      case "GBP":
        return "\u00A3";
      case "EUR":
        return "\u20AC";
      case "JPY":
        return "\u00A6";
      default:
        return "$";
    }
  },
  date : {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  }
};

jQuery(function ($) {
  $.extend($.fn, {
    moderniz: function () {//add features to clients lacking native support
      if (!Modernizr.input.placeholder && $("html.ie7,html.ie6").length == 0) {
        this.filter(":input[placeholder]").each(function () { //create label to contain placeholder
          if (this.label) {
            this.label.remove();
            this.label = null;
          }
          var $this = $(this);
          if (!this.isWrapped) {
            $this.wrap("<span style=\"position:relative\"></span>");
            this.isWrapped = true;
          }
          this.label = $("<label for=\"" + this.id + "\" class=\"placeholder modernizd\">" + $this.attr("placeholder") + "</label>")
          .toggle(this.value == ""); //hide if content present
          //position
          $this.after(this.label);
          this.label.css({
            position: "absolute",
            overflowX: "hidden",
            left: "2px",
            top: "0",
            fontFamily: $this.css("font-family"),
            fontWeight: $this.css("font-weight"),
            fontSize: $this.css("font-size"),
            color: "#888",
            cursor: "text"
          });
          $this.focus(function () { //hide on focus
            this.label.hide();
          }).blur(function () { //show if no content on blur
            this.label.toggle(this.value == "");
          })
          .hover(function () {
            this.label.hide();
          }, function () {
            if (!$(this).is(":focus")) {
              this.label.toggle(this.value == "");
            }
          })
          .change(function () {
            //this.label.toggle(this.value == "");
          });
        });
      }
      return this;
    }
  });
});
/* Modernizr */
$(function () {
  /* - attributes - */
  //auto focus
  if (!Modernizr.input.autofocus) {
    $("[autofocus]").focus();
  }
  //placeholder
  $(":input").moderniz();
  var ta = $("<textarea maxlength=\"5\">");
  //maxlength
  if (!ta[0].maxLength) {
    $("textarea[maxlength]").live("keypress", function (e) {
      var length = $(this).attr("maxlength");
      return !((this.value.length >= (length)) && ((e.which > 8 && e.which < 11) || (e.which == 13) || (e.which > 31 && (e.which < 37 || e.which > 40))));
    });
  }
  ta = null;
});