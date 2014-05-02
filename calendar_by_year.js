/*jslint indent: 2, maxlen: 80 */

// TODO
// - Refactor the code; clean it up

$(function () {
  console.log("ready!");
  buildYearCalendar(new Date().getFullYear());
});

var SELECTED = 'selected';
var SELSTART = 'select-start';
var SELEND   = 'select-end';
var MONTHS   = ['january', 'february', 'march', 'april',
                'may', 'june', 'july', 'august',
                'september', 'october', 'november', 'december'];
var DAYNAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function resetSelection() {
  $('.selected').removeClass(SELECTED);
  $('.select-start').removeClass(SELSTART);
  $('.select-end').removeClass(SELEND);
}

function resetSelectedDays() {
  $('.day.selected').removeClass(SELECTED);
}

function range(low, high) {
  var i, range_array = [];

  for (i = low; i <= high; i++) {
    range_array.push(i);
  }

  return range_array;
}

function buildYearCalendar(year) {
  var populateWeek = function (start_date, start_day, num_of_days) {
    var i, day_number, week_days = [0, 0, 0, 0, 0, 0, 0]; // Exactly 7 elements

    if (num_of_days > 7) {
      num_of_days = 7;
    }

    // TODO Clean this up; this is hard to read!
    for (i = start_day, day_number = start_date; i < num_of_days; i++, day_number++) {
      week_days[i] = day_number;
    }

    return { weekdays: week_days, daynumber: day_number };
  };

  var populateWeekDayNames = function(month_id) {
    var table_id = '#' + month_id;

    $(table_id).append('<thead />');

    var table_header = $(table_id).find('thead').first();

    $(table_header).append('<tr>');
    var table_header_row = $(table_header).find('tr');
    $(table_header_row).append('<th class="month_name" colspan="7">' + month_id + '</th>');

    $(table_header).append('<tr>');
    var table_header_row = $(table_header).find('tr')[1];

    DAYNAMES.forEach(function (dayname) {
      $(table_header_row).append('<th>' + dayname + '</th>');
    });
  };

  var stringifyDate = function (date) {
    function zeroPad(n) {
      return (n < 10 ? '0' : '') + n;
    }
    function stringize(year, month, date) {
      return         year   + '-' +
             zeroPad(month) + '-' +
             zeroPad(date);
    }
    return stringize(date.getFullYear(),
                     date.getMonth() + 1,
                     date.getDate());
  };

  var populateMonth = function (year, month) { // Month range: 0-11
    var buildWeek = function() {
      return [0, 0, 0, 0, 0, 0, 0];
    };
    var fillWeek = function(start_date) {
      start_date = start_date || 0;
      while(start_date < 7) {
        week[start_date] = month_date;
        month_date++;
        start_date++;

        if (month_date > days_in_month) {
          break;
        }
      }
    };
    var month_array = [];
    var month_date = 1;
    var days_in_week;

    // Get the number of days for the month
    var days_in_month = new Date(year, month + 1, 0).getDate();

    // Find which day the first day of the month falls on
    var date_value = new Date(year, month, 1);
    var first_day = date_value.getDay();

    // Create first row of the week, based on the first day
    var week = buildWeek();
    fillWeek(first_day);
    month_array = week;

    // thereafter, fill the days until the end of the month
    while(month_date <= days_in_month) {
      week = buildWeek();
      fillWeek();
      month_array = month_array.concat(week);
    }

    // Now display the month in HTML
    var month_id = MONTHS[month];
    var table_id = '#' + month_id;

    populateWeekDayNames(month_id);
    $(table_id).append('<tbody />');
    var table_body = $(table_id).find('tbody').first();
    var createTableRow = (function() {
      $(table_body).append('<tr>');
      return $(table_body).find('tr:last');
    });

    for (var i = 0; i < month_array.length; i++) {
      if (i % 7 == 0) {
        table_row = createTableRow();
      }

      if (month_array[i] > 0) {
        var string_date = stringifyDate(new Date(year, month, month_array[i]));
        $(table_row).append('<td class="day" data-yc-value="' + string_date + '">' + month_array[i] + '</td>');
      } else {
        $(table_row).append('<td />');
      }
    }
  };

  var setupTriggers = function() {
    $('#year ul li').click(function () {
      yearClicked(this);
    });

    $('.month_name').click(function () {
      monthClicked(this);
    });

    $('.day').click(function () {
      dayClicked(this);
    });
  };

  // Remove the old year calendar; wipe the slade clean
  $('#year-calendar').hide();
  $('#year-calendar').empty();
  resetSelection();

  // Layout the calendar tables
  // Put up the year menu
  var year_div = document.createElement('div');
  year_div.id = 'year';
  var calendar_year = $('#year-calendar');
  var year_menu = document.createElement('ul');
  $(year_div).append(year_menu);
  $(calendar_year).append(year_div);

  for (i = year - 1; i <= year + 1; i++) {
    var item_list = document.createElement('li');
    var year_text = document.createTextNode(i);
    item_list.appendChild(year_text);

    if (i == year) {
      $(item_list).addClass('selected-year');
    }

    $(item_list).data('yc-year', i);
    $(year_menu).append(item_list);
  }

  MONTHS.forEach(function (month) {
    $(calendar_year).append('<table id="' + month + '" />');
  });

  for (var month = 0; month < 12; month++) {
    populateMonth(year, month);
  }

  updateSelectedDates();
  setupTriggers();
  $('#year-calendar').slideDown(250);
}

function toggleSelected(that) {
  $(that).toggleClass(SELECTED);
}

function selectMonth(month_id) {
  var month_id = '#' + month_id;
  var month_days = month_id + ' td.day';
  var month_selected = $(month_id).hasClass(SELECTED);

  resetSelection();

  if (month_selected) {
    $(month_days).removeClass(SELECTED);
    $(month_id).removeClass(SELECTED);
  } else {
    $(month_days).addClass(SELECTED);
    $(month_id).addClass(SELECTED);

    // Find the first day and last day of this month
    // and insert SELSTART/SELEND classes
    $($(month_id + ' .day').first()).addClass(SELSTART);
    $($(month_id + ' .day').last()).addClass(SELEND);
  }
}

function getDateAtPosition(that) {
  return $(that).data('yc-value');
}

function getDateAtSelectStart() {
  return getDateAtPosition('.select-start');
}

function getDateAtSelectEnd() {
  return getDateAtPosition('.select-end');
}

function getDateAtClick(that) {
  return getDateAtPosition(that);
}

function dayClicked(that) {
  var moved_select_start = false;
  var moved_select_end   = false;
  var start_date = getDateAtSelectStart();
  var end_date   = getDateAtSelectEnd();
  var that_date  = getDateAtClick(that);

  if (that_date < start_date) {
    // User selected an earlier date than the initial start date
    // Move it back
    $('.select-start').removeClass(SELSTART);
    $(that).addClass(SELSTART);
    moved_select_start = true;
  } else if (that_date < end_date) {
    // The user selected inside a selected range
    moved_select_end = true;
  }

  // if select-start is missing, clear all selection
  if ($('.select-start').length === 0) {
    resetSelection();
  }

  toggleSelected(that);

  if ($('.day.selected').length == 1) {
    $(that).addClass(SELSTART);
  }

  // Check if there are more than one .selected
  if ($('.day.selected').length > 1) {
    var days = $('.day');
    var select_toggle = false;

    if (!moved_select_start) {
      $('.day.select-end').removeClass(SELEND);
      $(that).addClass(SELEND);
    }

    resetSelectedDays();

    days.each(function (index, day) {
      if ($(day).hasClass(SELSTART)) {
          select_toggle = true;
      }
      if ($(day).hasClass(SELEND)) {
        $(day).addClass(SELECTED);
        select_toggle = false;
        return; // stop processing loop
      }

      if (select_toggle) {
        $(day).addClass(SELECTED);
      }
    });
  }

  updateSelectedDates();
}

function getMonthId(that) {
  return $(that).parents('table')[0].id;
}

function monthClicked(that) {
  selectMonth(getMonthId(that), resetSelection);
  updateSelectedDates();
}

function yearClicked(that) {
  // See if the current year is selected
  var is_year_current = $(that).hasClass('selected-year');

  if (is_year_current) {
    var year_cal_id = '#year-calendar';
    var calendar_selected = $(year_cal_id).hasClass(SELECTED);

    resetSelection();
    if (!calendar_selected) {
      $(year_cal_id + ' .day').addClass(SELECTED);
      $(year_cal_id).addClass(SELECTED);

      $(year_cal_id + ' .day:first').addClass(SELSTART);
      $(year_cal_id + ' .day:last').addClass(SELEND);
    }
  } else {
    // Switch current year to the selected year
    // Redo the calendar
    var selected_year = $(that).data('yc-year');
    buildYearCalendar(selected_year);
  }

  updateSelectedDates();
}

function updateSelectedDates() {
  var start_date = getDateAtSelectStart();
  var end_date   = getDateAtSelectEnd();
  var date_text  = 'Select a date, month or year';

  if (start_date) {
    if (!end_date) {
      date_text = 'Selected Date: ' + start_date;
    } else {
      date_text = 'Selected Dates: ' + start_date + ' to ' + end_date;
    }
  }

  $('#date-range').text(date_text);
}
