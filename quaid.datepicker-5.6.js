/*
* Quaid.DatePicker
* 
* Adds a DatePicker to any input elements with class "date".
* 
* Version:  5.6
* Updated:  05/08/2011
* Author:   Chris Lienert
* Changes:  Updated to match quaid.core-2.x and quaid.forms-4.x
* 
* Requires: jQuery
*           Quaid Core (quaid.core-2.x.js)
*           Quaid Forms (quaid.forms-4.x.js)
*           Associated CSS styling (datepicker.css) 
*/
quaid.datePicker = function () {
  var date = new Date();

  var header = document.createElement("span");
  //create date picker HTML
  var createTable = function () {
    function setFocusTimeOut() {
      window.setTimeout("quaid.datePicker.clearTimer()", 1);
    };

    //table
    var table = document.createElement("table");
    table.id = "datepicker";
    var $table = $(table);
    //caption
    var caption = document.createElement("caption");
    var $prevYear = $("<a title=\"Previous Year\" id=\"year-down\" class=\"nav\" href=\"#\">&#171;</a>")
    .click(function () {
      quaid.datePicker.setYear(-1);
      return false;
    })
    .mousedown(setFocusTimeOut);
    caption.appendChild($prevYear[0]);

    var $prevMonth = $prevYear.clone()
    .attr({ title: "Previous Month", id: "month-down" })
    .html("&#8249;")
    .click(function () {
      quaid.datePicker.setMonth(-1);
      return false;
    })
    .mousedown(setFocusTimeOut);
    caption.appendChild($prevMonth[0]);

    caption.appendChild(header);

    var $nextMonth = $prevYear.clone()
    .attr({ title: "Next Month", id: "month-up" })
    .html("&#8250;")
    .click(function () {
      quaid.datePicker.setMonth(1);
      return false;
    })
    .mousedown(setFocusTimeOut);
    caption.appendChild($nextMonth[0]);

    var $nextYear = $prevYear.clone()
    .attr({ title: "Next Year", id: "year-up" })
    .html("&#187;")
    .click(function () {
      quaid.datePicker.setYear(1);
      return false;
    })
    .mousedown(setFocusTimeOut);
    caption.appendChild($nextYear[0]);

    table.appendChild(caption);

    //header row
    table.appendChild($("<thead><tr><th title=\"Sunday\" scope=\"col\">S</th><th title=\"Monday\" scope=\"col\">M</th><th title=\"Tuesday\" scope=\"col\">T</th><th title=\"Wednesday\" scope=\"col\">W</th><th title=\"Thursday\" scope=\"col\">T</th><th title=\"Friday\" scope=\"col\">F</th><th title=\"Saturday\" scope=\"col\">S</th></tr></thead>")[0]);

    //footer row
    var $foot = $("<tfoot><tr><td colspan=\"7\">Today: <a class=\"nav\" href=\"#\">" + date.format("dd/mm/yyyy") + "</a></td></tr></tfoot>");
    $foot.find("a.nav")
    .click(function () {
      quaid.datePicker.setDate(new Date());
      return false;
    })
    .mousedown(setFocusTimeOut);

    $table.click(setFocusTimeOut).mousedown(setFocusTimeOut)
    .hover(function () {//hide target error display on hover
      if (quaid.datePicker.target.error) {
        quaid.datePicker.target.error.hide();
      }
    });
    table.appendChild($foot[0]);

    table.body = document.createElement("tbody");

    var $td = $("<td><a href=\"#\"></a></td>");
    $td.find("a").mousedown(setFocusTimeOut)
    .click(function () {
      quaid.datePicker.selectDate(this.date);
      return false;
    });
    var $tr;
    for (var i = 0; i < 42; i++) {
      if (i % 7 === 0) {//first day of week
        $tr = $("<tr/>");
      }
      $td = $td.clone(true);
      $tr.append($td);
      if (i % 7 == 6) {//last day of week
        table.body.appendChild($tr[0]);
      }
    }
    table.appendChild(table.body);
    return table;
  };

  function construct() {
    this.table = createTable();
    this.table.onmousedown = function () {
      document.onmousedown = null;
    };
    this.table.onmouseup = function () {
      document.onmousedown = function () {
        quaid.datePicker.hide();
      };
    };
    this.clearTimer = function () {
      if (this.timeoutID) {
        window.clearTimeout(this.timeoutID);
      }
    };
    this.setHeaderText = function (text) {
      $(header).html(text);
    };
    this.setDate = function (newDate) {
      if (newDate) {
        date = new Date(newDate);
        if (!date.valueOf()) {//if an invalid value is provided, set to today's date.
          date = new Date();
        }
      }
      date.setDate(1); //initialise date to first day of the month
      this.setHeaderText(date.format(" mmmm yyyy "));

      var calendarDate = new Date(date);
      calendarDate.setDate(1 - date.getFirstDay());
      var today = new Date();

      //hide all rows
      $("tr", this.table.body).hide();
      var tr;
      for (var i = 0; i < (date.getLastDate() + (7 - date.getLastDay()) + date.getFirstDay()); i++) {
        if (i % 7 === 0 && (tr = this.table.body.childNodes[i / 7])) {//show required rows
          $(tr).show();
        }
        var c;
        if (calendarDate.getDate() == today.getDate() && calendarDate.getFullYear() == today.getFullYear() && calendarDate.getMonth() == today.getMonth()) {
          c = "today";
        } else {
          c = (i % 7 === 0 || i % 7 == 6 ? "we" : "wd");
          if (calendarDate.getMonth() == date.getMonth()) {
            c += "-current";
          }
        }
        var d = calendarDate.format("dd/mm/yyyy");
        $("td:nth-child(" + (i % 7 + 1) + "n)", tr)
        .attr("class", c)
        .find("a").html(calendarDate.getDate())
        .attr({ title: d })
        [0].date = d;
        calendarDate.setDate(calendarDate.getDate() + 1);
      }
    };
    this.setMonth = function (months) {
      date.setMonth(date.getMonth() + months);
      this.setDate();
    };
    this.setYear = function (years) {
      date.setYear(date.getFullYear() + years);
      this.setDate();
    };
    this.selectDate = function (date) {
      $(this.target).val(date)
      .focus()
      .blur()//trigger target's blur event
      .change(); //trigger target's change event
      this.hide();
    };
    this.hide = function () {
      if (this.target) {
        this.clearTimer();
        if (quaid.selects) {
          quaid.selects.show();
        }
        this.target = null;
        if (this.table.parentNode) {
          this.table.parentNode.removeChild(this.table);
        }
      }
    };
    this.show = function (t) {
      this.clearTimer();
      if (quaid.selects) {
        quaid.selects.hide();
      }
      if (this.target == t) {//hide date picker
        //        this.hide();//doesn't seem to be required and yet I can't work out why...
        return false;
      }
      document.onmousedown = null;
      this.target = t;
      if ($.validator.isDate(this.target.value)) {
        this.setDate(this.target.value.toDate());
      } else {
        this.setDate(new Date());
      }
      if (this.target.onfocus) {
        this.target.onfocus(); //link through to target's focus event
      }
      document.body.appendChild(this.table);
      //set position after displaying to allow for width of table to be taken into account
      var $t = $(t);
      var offset = $t.offset(); //calculate the position here just in case the document changes
      $(this.table).css({
        position: "absolute",
        top: offset.top + $t.outerHeight(),
        left: offset.left - $(":first", document.body).offset().left - ($(this.table).outerWidth() - $t.outerWidth()) / 2
      });
    };
    this.add = function (el) {
      $(el).mousedown(function () {
        if (!this.readOnly) {
          quaid.datePicker.show(el);
        }
      })
      .blur(function () {//hide datePicker if the user tabs out of the target field
        quaid.datePicker.timeoutID = window.setTimeout("quaid.datePicker.hide()", 150);
      })
      .focus(function () {//clear any existing timeouts on focus
        if (quaid.datePicker.target != el) {
          quaid.datePicker.hide();
        }
        quaid.datePicker.clearTimer();
      });
    };
  }
  return new construct();
} ();

$(function () {
  quaid.datePicker.setDate(new Date());
  $("input.date").each(function () {
    quaid.datePicker.add(this);
  });
});
