/*
* Quaid.Dialog
* 
* Creates a HTML dialog box.
* 
* Essentially a lighter weight version of the jQuery UI Dialog
* 
* Version:  1.02
* Updated:  18/11/2010
* Author:   Chris Lienert
* Changes:  Added noOverlay boolean to open() function to optionally suppress the overlay
* 
* Requires: jQuery 1.4.x or later
*/
jQuery(function ($) {
  $.quaidDialog = function (element) {
    this.element = element;
  };
  $.extend($.quaidDialog, {
    prototype: {
      _init: function () {//initialisation
        var self = this;
        self._overlay = $('<div class=\"dialog-overlay\"></div>').appendTo(document.body).hide(); //modal overlay. Style this to prevent access to elements behind the dialog
        self.box = $("<div class=\"dialog\"></div>")//add the dialog
          .append(self.element).appendTo(document.body)
          .hide();
        self._isOpen = false;
        $(document).keypress(function (e) {
          if (e.keyCode && e.keyCode == 27) {//esc
            $.data(self.element, "quaidDialog").close(); //call dialog close
          }
        });
      },
      open: function (noOverlay) {
        if (!this._isOpen) {
          if (!noOverlay) {
            this._overlay.show();
          }
          this.box.show();
          this._isOpen = true;
        }
      },
      close: function () {
        if (this._isOpen) {
          this._overlay.hide();
          this.box.hide();
          this._isOpen = false;
        }
      },
      setPosition: function (location) {//set top/left position of the dialog
        if (!location) {//ensure params are provided
          return;
        }
        if (location.top) {//set top if provided ensuring it stays inside the client window
          this.box.css({ top: Math.max(location.top, $(document).scrollTop() - $(document.body).offset().top) });
        }
        if (location.left) {//set left if provided
          this.box.css({ left: location.left });
        }
      }
    }
  });
  $.extend($.fn, {
    quaidDialog: function () {//jQuery function
      return this.each(function () {
        //if no instance exists for the calling element(s), create a new one.
        var instance = $.data(this, "quaidDialog");
        (!instance &&
        $.data(this, "quaidDialog", new $.quaidDialog(this))._init());
      });
    }
  });
});