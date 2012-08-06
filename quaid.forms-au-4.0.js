/*
* Quaid.Forms.AU
* 
* Contains various Australia specific validation rules and error messages
* 
* Version:  4.0.6 (in sync with quaid.forms-4.0.js)
* Updated:  1/08/2012
* Author:   Chris Lienert
* Changes:  Added integer validation
*           Updated error messages
*
* Requires: jQuery 1.6.x
*           Quaid Core 2.x (quaid.core-2.x.js)
*           Quaid Forms 4.x (quaid.forms.4.x.js)
*/
$(function () {
  //validator
  $.extend($.validator, {
    //accepts 1/1/01 through 01-01-0001
    isDate: function (s) {
      return /^(?=\d)(?:(?:31(?!.(?:0?[2469]|11))|(?:30|29)(?!.0?2)|29(?=.0?2.(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(?:\x20|$))|(?:2[0-8]|1\d|0?[1-9]))([-\/])(?:1[012]|0?[1-9])\1(?:1[6-9]|[2-9]\d)?\d\d(?:(?=\x20\d)\x20|$))?$/.test(s);
    },
    fixTime: function (f) { //converts hhmm to hh:mm from form field f. Use with onblur or during form validation
      if (f.value.search(/\d{4}/) === 0) { //ensure the correct number of digits
        f.value = f.value.substr(0, 2) + ":" + f.value.substr(2, 2);
      }
    },
    isYear: function (s) { //check that it is a 4 digit number
      return (/^\d{4}$/.test(s));
    },
    isTime: function (t) { // checks for a valid 24hr time hh:mm or h.mm
      return (/^(([0-1]?\d)|(2[0-3]))(:|\.)([0-5]\d)$/.test(t));
    },
    isMail: function (e) { //checks email address conforms to a@b.c format
      return (/^([\w!#%&$'*+\-=?^_`{|}~]+[\w!#%&$'*+\-=?^_`{|}~.]+[\w!#%&$'*+\-=?^_`{|}~]+|[\w!#%&$'*+\-=?^_`{|}~]{1,2})@([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+$/.test(e));
    },
    isDecimal: function (d) { //checks decimal conforms to n,nnn.n format where n is an integer
      return (/^-?(\d+|\d{1,3}(,\d{3})+)(\.\d+)?$/.test(d));
    },
    isCurrency: function (c) {
      return this.isDecimal(c.replace(/[\$€£,]/g, "")) && (/^-?[\$€£]?[0-9,]+(\.\d{2})?$/.test(c));
    },
    isPostCode: function (p) {
      return /^\d{4}$/.test(p);
    },
    isPhoneNumber: function (s) { //matches (12) 3456 7890, 1234567890, 12 3456 7890, (12)-3456-7890, 12.3456.7890
      //return (/^\(?\d{2}\)?[-.\s]?\d{4}[-.\s]?\d{4}|\d{4}[-.\s]?\d{3}[-.\s]?\d{3}|\+\d{2}[-.\s]\d[-.\s]\d{4}[-.\s]\d{4}$/.test($.trim(s)));//, +61 8 9426 4444
      return (/^(\(?\d{2}\)?[-.\s]?\d{4}[-.\s]?\d{4}|\d{4}[-.\s]?\d{3}[-.\s]?\d{3})$/.test($.trim(s)));
    },
    isMobile: function (s) { //matches 0412 345 678, 0412345678, 0412-345-678, 0412.345.678
      //return (/^(0|\+61[-.\s])\d{3}[-.\s]?\d{3}[-.\s]?\d{3}$/.test($.trim(s)));//, +61 412 345 678
      return (/^0\d{3}[-.\s]?\d{3}[-.\s]?\d{3}$/.test($.trim(s)));
    },
    isCCNumber: function (value) {
      return /^((4\d{3})|(5[1-5]\d{2})|(6011))(\s|)?\d{4}(\5\d{4}){2}$/.test(value);
    },
    isCSC: function (value) {
      return /^\d{3,4}$/.test(value);
    },
    message: {
      submitFailed: "The form could not be submitted. Please refer to the highlighted field(s) for further instructions.",
      required: "Please enter a value",
      whitespace: "Please enter a value",
      selectRequired: "Please select a value",
      radioRequired: "Please check an answer",
      checkRequired: "Please check the box",
      email: "Email address entered is not valid",
      mobile: "Mobile number entered is not valid e.g. 0412 345 678",
      //mobile: "Mobile number entered is not valid e.g. 0412 345 678 or +61 412 345 678",
      phone: "Phone number entered is not valid e.g. (09) 1234 5678 or 1200 123 456",
      //phone: "Phone number entered is not valid e.g. (09) 1234 5678, 1200 123 456 or +61 9 1234 5678",
      postcode: "Postcode entered is not valid e.g. 3000",
      date: "Date entered is not valid e.g. 05/10/2007",
      time: "Time entered is not valid e.g. 13:55",
      year: "Year entered is not valid",
      number: "Please enter a valid number",
      positiveNumber: "Please enter a valid positive number",
      integer: "Please enter a whole number without decimals.",
      positiveInteger: "Please enter a positive whole number without decimals.",
      currency: "Please enter a valid number",
      credit_card: "Credit card number entered is not valid",
      csc: "CSC number entered is not valid"
    }
  });
});