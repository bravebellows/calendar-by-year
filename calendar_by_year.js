/*jslint indent: 2, maxlen: 80 */

// TODO
// - Write tests
//
// - Refactor the code; clean it up

$(function () {
  console.log("ready!");
  build_calendar_by_year(2014);

  $('#year').click(function () {
    year_clicked(this);
  });

  $('.month_name').click(function () {
    month_clicked(this);
  });

  $('.day').click(function () {
    day_clicked(this);
  });
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
  var i, rangeArray = [];

  for (i = low; i <= high; i++) {
    rangeArray.push(i);
  }

  return rangeArray;
}

function build_calendar_by_year(year) {
  var populateWeek = function (startDate, startDay, numOfDays) {
    var i, dayNumber, weekDays = [0, 0, 0, 0, 0, 0, 0]; // Exactly 7 elements

    if (numOfDays > 7) {
      numOfDays = 7;
    }

    // TODO Clean this up; this is hard to read!
    for (i = startDay, dayNumber = startDate; i < numOfDays; i++, dayNumber++) {
      weekDays[i] = dayNumber;
    }

    return { weekdays: weekDays, daynumber: dayNumber };
  };

  var populateWeekDayNames = function (monthID) {
    var tableID   = '#' + monthID;

    $(tableID).append('<thead />');

    var tableHeader = $(tableID).find('thead')[0];

    $(tableHeader).append('<tr>');
    var tableHeaderRow = $(tableHeader).find('tr');
    $(tableHeaderRow).append('<th class="month_name" colspan="7">' + monthID + '</th>');

    $(tableHeader).append('<tr>');
    var tableHeaderRow = $(tableHeader).find('tr')[1];

    DAYNAMES.forEach(function (dayname) {
      $(tableHeaderRow).append('<th>' + dayname + '</th>');
    });
  };

  var populateMonth = function (year, month) {
    var monthID   = MONTHS[month];
    var firstDay  = new Date(year, month, 1).getDay(); // 0-6 => Sun-Sat
    var week      = [];
    var nextDate  = 1;
    var monthDays = new Date(year, month+1, 0).getDate(); // # of days in month
    var rowOffset = 0;
    var tableID   = '#' + monthID;

    populateWeekDayNames(monthID);

    $(tableID).append('<tbody />');
    var tableBody = $(tableID).find('tbody')[0];

    var weekInfo, tableBodyRow;
    while (monthDays > 0) {
      weekInfo  = populateWeek(nextDate, firstDay, monthDays); // first week of the month
      $(tableBody).append('<tr>');
      tableBodyRow = $(tableBody).find('tr:last');

      weekInfo.weekdays.forEach(function (weekday) {
        var dayText = '';
        var dayDate = weekday;
        var dayClass = '';

        if (dayDate > 0) {
          dayText = weekday;
          dayClass = 'day';
        }

        $(tableBodyRow).append('<td class="' + dayClass + '">' + dayText + '</td>');
      });

      // Generate data for the next week
      nextDate   = weekInfo.daynumber;
      monthDays -= 7 - firstDay;
      firstDay   = 0;
    }
  };

  // Layout the calendar tables
  var calendarYear = $('#year-calendar');
  $(calendarYear).append('<p id="year" />');

  MONTHS.forEach(function (month) {
    $(calendarYear).append('<table id="' + month + '" />');
  });

  // Update the year
  $('#year').text('' + year);

  for (var month = 0; month < 12; month++) {
    populateMonth(year, month);
  }
}

function toggleSelected(that) {
  $(that).toggleClass(SELECTED);
}

function selectMonth(monthID) {
  var month_id = '#' + monthID;
  var month_days = month_id + ' td.day';
  var monthSelected = $(month_id).hasClass(SELECTED);

  resetSelection();

  if (monthSelected) {
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

function getDateAtPosition(classOrThat) {
  var month, monthNumber, dayNumber, dateValue;

  try {
    month = $(classOrThat).parents('table')[0].id;
    monthNumber = MONTHS.indexOf(month);
    dayNumber = $(classOrThat)[0].innerText;

    dateValue = (parseInt(monthNumber) * 100) + (parseInt(dayNumber));
    return dateValue;
  } catch(e) {
    return;
  }
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

function day_clicked(that) {
  var movedSelectStart = false;
  var movedSelectEnd   = false;
  var startDate = getDateAtSelectStart();
  var endDate   = getDateAtSelectEnd();
  var thatDate  = getDateAtClick(that);

  if (thatDate < startDate) {
    // User selected an earlier date than the initial start date
    // Move it back
    $('.select-start').removeClass(SELSTART);
    $(that).addClass(SELSTART);
    movedSelectStart = true;
  } else if (thatDate < endDate) {
    // The user selected inside a selected range
    movedSelectEnd = true;
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
    var selectToggle = false;

    if (!movedSelectStart) {
      $('.day.select-end').removeClass(SELEND);
      $(that).addClass(SELEND);
    }

    resetSelectedDays();

    days.each(function (index, day) {
      if ($(day).hasClass(SELSTART)) {
          selectToggle = true;
      }
      if ($(day).hasClass(SELEND)) {
        $(day).addClass(SELECTED);
        selectToggle = false;
        return; // stop processing loop
      }

      if (selectToggle) {
        $(day).addClass(SELECTED);
      }
    });
  }
}

function get_month_id(that) {
  return $(that).parents('table')[0].id;
}

function month_clicked(that) {
  selectMonth(get_month_id(that), resetSelection);
}

function year_clicked() {
  var yearCalID = '#year-calendar';
  var calendarSelected = $(yearCalID).hasClass(SELECTED);

  resetSelection();
  if (!calendarSelected) {
    $(yearCalID + ' .day').addClass(SELECTED);
    $(yearCalID).addClass(SELECTED);
  }
}
