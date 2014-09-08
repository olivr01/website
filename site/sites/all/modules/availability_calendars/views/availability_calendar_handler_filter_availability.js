(function($) {
  "use strict";

  /**
   * Initialization code based on the Drupal behaviors paradigm.
   *
   * Date popup pairs are coupled such that the maxDate or minDate setting is
   * changed when the other date field is changed.
   *
   * As the date popup module only creates the datepickers when the input fields
   * get the focus, we must set the maxValue and minValue options both in the
   * date popup module settings (drupal.settings.datePopup) (if not already
   * created) and in the datepicker object (if already created).
   */
  Drupal.behaviors.availabilityCalendarHandlerFilterAvailability = {
    attach: function(context, settings) {
      // Inner function prevents jslint warning "creating function within loop".
      function coupleDatePopups(datePopup1, datePopup2) {
        var isTo1 = datePopup2.name.indexOf("[to1]") !== -1;
        // When the from date gets set, change the minDate of the to(1) date.
        settings.datePopup[datePopup1.id].settings.onClose = function(selectedDate) {
          if (isTo1) {
            // We have an arrival and departure date. The departure date should
            // be greater than the arrival date. Create a date from the date
            // string, add 1 day and format it back into a string. Use the
            // dateFormat options (or date popup setting if not yet created)
            // from both dates to parse resp. format the date.
            selectedDate = $.datepicker.parseDate($("#" + datePopup1.id).datepicker("option", "dateFormat"), selectedDate);
            selectedDate.setDate(selectedDate.getDate() + 1);
            selectedDate = $.datepicker.formatDate($("#" + datePopup2.id).datepicker("option", "dateFormat") || settings.datePopup[datePopup2.id].settings.dateFormat, selectedDate);
          }
          settings.datePopup[datePopup2.id].settings.minDate = selectedDate;
          $(datePopup2).datepicker("option", "minDate", selectedDate);
        };
        // When the to(1) date gets set, change the maxDate of the from date.
        settings.datePopup[datePopup2.id].settings.onClose = function(selectedDate) {
          if (isTo1) {
            selectedDate = $.datepicker.parseDate($("#" + datePopup2.id).datepicker("option", "dateFormat"), selectedDate);
            selectedDate.setDate(selectedDate.getDate() - 1);
            selectedDate = $.datepicker.formatDate($("#" + datePopup1.id).datepicker("option", "dateFormat") || settings.datePopup[datePopup1.id].settings.dateFormat, selectedDate);
          }
          settings.datePopup[datePopup1.id].settings.maxDate = selectedDate;
          $(datePopup1).datepicker("option", "maxDate", selectedDate);
        };
      }

      if (settings.datePopup) {
        var datePopupPairs = {};
        var datePopupNames = ["from", "to", "to1"];

        // Find date popup pairs based on their name attribute. Date popups that
        // form a pair will have names like: <views filter name>[from][date] and
        // <views filter name>[to(1)][date].
        $(".form-type-date-popup").find("input").each(function() {
          var nameParts = this.name.replace(/\]/g, "").split(/\[/);
          if (nameParts.length === 3 && nameParts[2] === "date" && datePopupNames.indexOf(nameParts[1] !== -1)) {
            if (datePopupPairs[nameParts[0]] === undefined) {
              datePopupPairs[nameParts[0]] = [];
            }
            datePopupPairs[nameParts[0]].push(this);
          }
        });

        // Process the found date popup pairs.
        var key;
        for (key in datePopupPairs) {
          if (datePopupPairs.hasOwnProperty(key)) {
            if (datePopupPairs[key].length === 2) {
              coupleDatePopups(datePopupPairs[key][0], datePopupPairs[key][1]);
            }
          }
        }
      }
    }
  };

}(jQuery));
