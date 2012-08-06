/*
* Quaid.Forms
*
* Contains various form extention and validation methods.
*
* Validation rules are set via input type, attributes, class names and custom methods
* 
* Version:  4.0.6
* Updated:  3/08/2012
* Author:   Chris Lienert
* Changes:  Added integer validation.
*           Error messages are now contained in labels instead of ems
*           Shifted styles from label.errata to form5.css
*           Added ARIA states to fields ala http://www.punkchip.com/2010/12/aria-enhance-form-validation/
*           Added data-visible-field and accompanying setFieldToggle and toggleField methods to hide/show elements based on field values
* 
* Requires: jQuery 1.6.x
* Modernizr 2.x
* Quaid Core 2.x (quaid.core-2.x.js)
*/
jQuery(function ($) {
  $.extend($.fn, {
    addValidation: function (handler) {
      return this.each(function () {
        this.inlineValidation.push(handler);
      });
    },
    addServerValidation: function (settings) {
      return this.each(function () {
        this.serverValidation.push(new $.validator.serverValidator(this, settings));
      });
    },
    addSubmitValidation: function (handler) {
      return this.each(function () {
        this.submitValidation.push(handler);
      });
    },
    hasError: function () {
      var error = false;
      this.each(function () {
        if (!this.isValid) {
          error = true;
          return;
        }
      });
      return error;
    },
    clearForm: function () { //plugin for clearing form data via http://www.learningjquery.com/2007/08/clearing-form-data
      return this.each(function () {
        if (this.tagName.toLowerCase() == "form" || this.tagName.toLowerCase() == "fieldset") {
          return $($.validator.validatedFields, this).clearForm();
        }
        var $this = $(this);
        if ($this.is("select")) {
          this.selectedIndex = -1;
        } else if ($this.is(":radio,:checkbox")) {
          this.checked = false;
        } else {
          this.value = "";
        }
      });
    },
    predictOzState: function (target) {//pre-empts an Australian state based on a postcode see: http://en.wikipedia.org/wiki/Postcodes_in_Australia
      //todo: change this to predictState and move the data-state-field attribute
      return this.change(function () {
        var postcode = $(this).val();
        var state = "";
        if ((postcode >= 1000 && postcode <= 2599) || (postcode >= 2619 && postcode <= 2898) || (postcode >= 2921 && postcode <= 2999)) {
          state = "NSW";
        } else if ((postcode >= 200 && postcode <= 299) || (postcode >= 2600 && postcode <= 2618) || (postcode >= 2900 && postcode <= 2920)) {
          state = "ACT";
        } else if ((postcode >= 3000 && postcode <= 3999) || (postcode >= 8000 && postcode <= 8999)) {
          state = "VIC";
        } else if ((postcode >= 4000 && postcode <= 4999) || (postcode >= 9000 && postcode <= 9999)) {
          state = "QLD";
        } else if ((postcode >= 5000 && postcode <= 5999)) {
          state = "SA";
        } else if ((postcode >= 6000 && postcode <= 6797) || (postcode >= 6800 && postcode <= 6999)) {
          state = "WA";
        } else if ((postcode >= 7000 && postcode <= 7999)) {
          state = "TAS";
        } else if ((postcode >= 800 && postcode <= 999)) {
          state = "NT";
        }
        if (state != "") {//clear error and reset target validation
          $(target).val(state)[0].checkValid();
        }
      });
    },
    initValidation: function () {//assign properties/methods and auto-correct events
      this.moderniz()//add any non-native features
      .each(function () {
        this.validate = $.validator.checkInputValid;
        this.checkValid = function (submit) {//pass true if validating on form submit
          this.clearError();
          if (!this.validate(submit)) {
            this.displayError();
          }
          return this.isValid;
        };
        this.displayError = $.validator.displayError;
        this.clearError = $.validator.clearError;
        this.inlineValidation = [];
        this.serverValidation = [];
        this.submitValidation = [];
        this.hasSubmitError = false;
        //dirty handling -> store original value
        this.originalValue = $(this).val();
        this.isDirty = function () {
          return $(this).val() != this.originalValue;
        };
      })
      .focus($.validator.showError)
      .hover($.validator.showError, $.validator.hideError)
      .blur($.validator.hideError);
      //trim spaces
      this.filter("input[type=email]").blur(function () {
        this.value = $.trim(this.value);
      });
      //format dates
      this.filter("." + $.validator.rule.date).blur(function () {
        if (this.value != "" && $.validator.isDate(this.value)) {
          this.value = this.value.toDate($(this).hasClass("birth")).format("dd/mm/yyyy");
        }
      });
      //format currency
      this.filter("." + $.validator.rule.currency + ", ." + $.validator.rule.positive_currency).change(function () {
        if (this.value != "" && $.validator.isCurrency(this.value)) {
          var $this = $(this);
          var currencySymbol = "$";
          if ($this.hasClass("GBP")) {
            currencySymbol = "\u00A3";
          } else if ($this.hasClass("EUR")) {
            currencySymbol = "\u20AC";
          } else if ($this.hasClass("JPY")) {
            currencySymbol = "\u00A6";
          }

          if ($this.hasClass("whole")) {
            this.value = this.value.toFloat().toWholeCurrency(currencySymbol);
          } else {
            this.value = this.value.toFloat().toCurrency(currencySymbol);
          }
        }
      });
      //init postcode state predictor
      this.filter("." + $.validator.rule.postcode).each(function () {
        var $this = $(this);
        if ($this.data("stateField")) {
          $this.predictOzState("#" + $this.data("stateField"));
        }
      });
      //init radios
      this.filter(":not[:radio]").blur(function () {
        if ((!(this.required || $(this).attr("required") == "required") && this.value == "") || this.value != "") {
          this.checkValid();
        }
      });
      this.filter("input:radio, input:checkbox").each(function(){
        this.parent = $(this).closest($.validator.parentElements);
        if (this.type === "radio") {
          this.label = $(this).parent("label");
        } else {
         this.label = this.parent.find("label[for='" + this.id + "']");
        }
      })
      .click(function () {
        this.parent.find("input[name='" + this.name + "']").each(function(){
          this.checkValid()
        })
      });
      //change event for selects
      this.filter("select").change(function () {
        if (this.value != "") {
          this.checkValid();
        }
      });
      return this;
    },
    initFormValidation: function() {
      //disable built-in validation
      this.attr("novalidate", "novalidate")
      .each(function () {
        this.validate = true; //set to false to disable validation for this form
        this.checkValid = function () {
          try {
            if (!this.validate) {
              return true;
            }
            var f = this;
            f.invalidElements = [];
            $($.validator.validatedFields, f).each(function () {
              if (!this.checkValid(true)) {
                f.invalidElements.push(this);
              }
            });

            if (f.invalidElements.length === 0) {
              return true;
              //alert("submit!");return false;//test
            } else {
              alert($.validator.message.submitFailed);
              //focus on first invalid field
              f.invalidElements[0].focus();
              return false;
            }
          } catch (e) {//pass through to server side validation
            alert("An error has occurred:\n" + e); //debug
            //todo: log error
            return true;
          }
        };
      })
      .submit(function () {
        return this.checkValid();
      });
      $(":submit", this).click(function () {
        this.form.clickedSubmit = this;
      });

      $($.validator.validatedFields, this).initValidation();
      return this;
    },
    //hide/show a target element based on the value of a form field.
    setFieldToggle: function (target){
      return this.each(function(){
        var $this = $(this);
        $this.change(function(){
          $this.toggleField(target);
        });
        //set initial state
        $this.toggleField(target,0);
      });
    },
    toggleField: function(target,duration){
      return this.each(function () {
        if (!duration){
          duration = "fast";
        }
        if (this.checked || this.value === target.data("visibleValue")) {
          target.slideDown(duration);
        } else {
          target.slideUp(duration);
        }
      });
    }
  });
});

$(function () {
  //validator
  $.validator = function () {
  };
  $.extend($.validator, {
    rule: {//Set of validation rules used to validate form fields
      no_whitespace: "no_whitespace",
      mobile: "mobile",
      phone: "phone",
      postcode: "postcode",
      date: "date",
      time: "time",
      year: "year",
      numeric: "numeric",
      positive_numeric: "positive_numeric",
      integer: "integer",
      positive_integer: "positive_integer",
      currency: "currency",
      positive_currency: "positive_currency",
      credit_card: "credit_card",
      csc: "csc"
    },
    parentElements: "p,td,th,li",
    //validatedFields: ":text, :password, :radio, :checkbox, :file, [type=email], [type=tel], [type=url], [type=search], select, textarea",
    //more specific selectors for IE 6-8 when displaying VML. See http://bugs.jquery.com/ticket/7071
    validatedFields: "input:text, input:password, input:radio, input:checkbox, input:file, input[type=email], input[type=tel], input[type=url], input[type=search], select, textarea",
    serverValidator: function (target, args) {
      var self = this;
      self.settings = $.extend({
        path: "",
        handler: function (data) { //generic server validation handler
          this.isValid = (this.errorMessage = data.Message) == "";
          this.displayError();
        },
        getValue: function () { //override for complex calls i.e. involving multiple fields
          return self.target.value;
        }
      }, args);
      self.target = target;
      self.validate = function (submit) {
        $.ajax({ url: self.settings.path + self.settings.getValue() + "&caller=" + self.target.id,
          dataType: 'json',
          async: !submit,
          context: self.target,
          success: self.settings.handler
        });
      };
    },
    /* form field extensions */
    //show an element's error message
    showError: function () {
      if (this.error && !this.isValid) {
        var $this = $(this);
        var offParent = ($this.offsetParent().is(this.parent) ? this.parent : this.parent.offsetParent()).offset(); //fetch offset from parent or higher
        var offset = $this.offset();
        this.error.show()
        .css({
          top: offset.top + $this.outerHeight() - offParent.top,
          left: offset.left - offParent.left
        });
      }
    },
    //hides an element's error message
    hideError: function () {
      if (this.error && !$(this).is(":focus")) {
        this.error.hide();
      }
    },
    //displays an em inside the parent element containing the element's error message
    displayError: function () {
      if (this.isValid) {
        return;
      }
      if (!this.parent) {
        this.parent = $(this).closest($.validator.parentElements);
      }
      if (this.label) {
        this.label.addClass("alert");
      }
      if (!this.error) {
        this.error = $("<label for=\"" + this.id + "\" role=\"alert\" class=\"errata js-hover\"/>");
      }
      this.error.html(this.errorMessage).appendTo(this.parent).hide();
      $(this).addClass("invalid")
      .attr("aria-invalid", "true");
    },
    //clears any errors associated with this element
    clearError: function () {
      //todo: abstract this.parent
      if (!this.parent) {
        this.parent = $(this).closest($.validator.parentElements);
      }
      this.parent.children(".server-error").remove();
      if (this.label) {
        this.label.removeClass("alert");
      }
      $(this).removeClass("invalid")
      .removeAttr("aria-invalid");
      if (this.error) {
        this.error.hide();
      }
    },
    //performs validation of the field's value
    checkInputValid: function (submit) {
      var self = this;
      var $self = $(self);
      self.isValid = true;
      if (self.disabled || self.readOnly || $self.is(":hidden")) {
        return true; //don't validate missing, disabled or hidden fields
      }
      //check for conditional validation
      if ($self.data("requiredField")) {
        var reqField = $("#" + $self.data("requiredField"));
        self.required = reqField.attr("checked") || reqField.val() == $self.data("requiredValue");
      }

      var type = $self.attr("type");
      //missing value
      if (self.required || $self.attr("required") == "required") {
        switch (type) {
          case "select-multiple":
            if (!(self.isValid = self.selectedIndex !== -1)) {
              self.errorMessage = $.validator.message.selectRequired;
              return false;
            }
            break;
          case "select-one": //if there's only value available, field is valid
            if (!(self.isValid = (this.selectedIndex != -1 && (!(this.selectedIndex === 0 && this.options[0] && this.options[0].value === ""))))) {
              self.errorMessage = $.validator.message.selectRequired;
              return false;
            }
            break;
          case "radio":
            if ($(self).closest($.validator.parentElements)[0].disabled) {//don't validate disabled radio buttons
              break;
            }
            if (!(self.isValid = $(self).closest($.validator.parentElements).find(":checked").length !== 0)) {
              self.errorMessage = $.validator.message.radioRequired;
              return false;
            }
            break;
          case "checkbox":
            if (!(self.isValid = self.checked)) {
              self.errorMessage = $.validator.message.checkRequired;
              return false;
            }
            break;
          default:
            if (!(self.isValid = self.value.length !== 0)) {
              self.errorMessage = $.validator.message.required;
              return false;
            }
            break;
        }
      };
      //type mismatch
      switch (type) {
        case "email":
          if (!(self.isValid = $.validator.isMail(self.value) || (self.value.length === 0))) {
            self.errorMessage = $.validator.message.email;
            return false;
          }
          break;
        case "tel":
          if ($self.hasClass($.validator.rule.mobile)) {
            if (!(self.isValid = $.validator.isMobile(self.value) || self.value.length === 0)) {
              self.errorMessage = $.validator.message.mobile;
              return false;
            }
          } else {
            if (!(self.isValid = $.validator.isPhoneNumber(self.value) || self.value.length === 0)) {
              self.errorMessage = $.validator.message.phone;
              return false;
            }
          }
          break;
        case "text": //additional validation classes for text inputs
          if ($self.hasClass($.validator.rule.no_whitespace) && !(self.isValid = $.trim(self.value).length > 0 || self.value.length === 0)) {
            self.errorMessage = $.validator.message.whitespace;
            return false;
          }
          if ($self.hasClass($.validator.rule.postcode) && !(self.isValid = $.validator.isPostCode(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.postcode;
            return false;
          }
          if ($self.hasClass($.validator.rule.date) && !(self.isValid = $.validator.isDate(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.date;
            return false;
          }
          if ($self.hasClass($.validator.rule.time) && !(self.isValid = $.validator.isTime(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.time;
            return false;
          }
          if ($self.hasClass($.validator.rule.year) && !(self.isValid = $.validator.isYear(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.year;
            return false;
          }
          if ($self.hasClass($.validator.rule.numeric) && !(self.isValid = !isNaN(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.number;
            return false;
          }
          if ($self.hasClass($.validator.rule.positive_numeric) && !(self.isValid = (!isNaN(self.value) && self.value.indexOf("-") === -1) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.positiveNumber;
            return false;
          }
          if ($self.hasClass($.validator.rule.integer) && !(self.isValid = (!isNaN(self.value) && self.value.indexOf(".") === -1) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.integer;
            return false;
          }
          if ($self.hasClass($.validator.rule.positive_integer) && !(self.isValid = (!isNaN(self.value) && self.value.indexOf("-") === -1 && self.value.indexOf(".") === -1) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.positiveInteger;
            return false;
          }
          if ($self.hasClass($.validator.rule.currency) && !(self.isValid = $.validator.isCurrency(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.currency;
            return false;
          }
          if ($self.hasClass($.validator.rule.positive_currency) && !(self.isValid = ($.validator.isCurrency(self.value) && self.value.indexOf("-") == -1) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.currency;
            return false;
          }
          if ($self.hasClass($.validator.rule.credit_card) && !(self.isValid = $.validator.isCCNumber(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.credit_card;
            return false;
          }
          if ($self.hasClass($.validator.rule.csc) && !(self.isValid = $.validator.isCSC(self.value) || self.value.length === 0)) {
            self.errorMessage = $.validator.message.csc;
            return false;
          }
          break;
      }
      //todo: pattern mismatch
      //todo: too long
      //todo: underflow
      //todo: overflow
      //todo: step mismatch
      //custom validation
      self.inlineValidation.forEach(function (handler) {
        handler(self);
        if (!self.isValid) {
          return false;
        }
      });
      self.serverValidation.forEach(function (validator) {
        validator.validate(submit);
        if (!self.isValid) {
          return false;
        }
      });
      //deferred validation (i.e. on form submit)
      if (submit) {
        if (self.submitValidation.length > 0) {
          self.hasSubmitError = false;
        }
        self.submitValidation.forEach(function (handler) {
          handler(self);
          if (!self.isValid) {
            self.hasSubmitError = true; //hook for checking submit errors
            return false;
          }
        });
      }
      if (self.isValid) {//clear error messages for valid fields
        self.errorMessage = "";
      }
      return self.isValid;
    }
  });

  /* form extensions */
  var $forms = $("form").not("[novalidate]")
  .initFormValidation();

  //capture and claim any server validation
  $(".invalid label.server-error", $forms).each(function (i) {
    var $this = $(this);
    $("[id^=" + this.className.replace(/.*\sfor-(\w*).*/, "$1") + "]", $forms).each(function (j) {
      this.errorMessage = $this.html();
      this.isValid = false;
      this.displayError();
      this.parent.removeClass("invalid");
      if (i + j == 0) {
        this.focus();
      }
    });
    $this.remove();
  });

  //initialise visibility toggling fields
  $("[data-visible-field]").each(function(){
    var $this = $(this);
    $("#" + $this.data("visibleField")).setFieldToggle($this)
  });
});