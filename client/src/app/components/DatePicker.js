import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

function getDisabledDates(ranges) {
  const dates = [];
  ranges.forEach(({ start, end }) => {
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });
  return dates;
}

function DatePicker({ startDate, endDate, onChange, disabledRanges = [] }) {
  // Ensure we don't allow past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectionRange = {
    startDate: startDate,
    endDate: endDate,
    key: 'selection',
  };

  const handleSelect = (ranges) => {
    const newStartDate = ranges.selection.startDate;
    const newEndDate = ranges.selection.endDate;
    
    // Allow today, block only strictly past dates
    if (newStartDate.setHours(0,0,0,0) < today.getTime()) {
      return; // Don't update if start date is before today
    }
    
    // Allow single-day bookings by ensuring endDate is at least startDate
    const finalEndDate = newEndDate >= newStartDate ? newEndDate : newStartDate;
    
    onChange(newStartDate, finalEndDate);
  };

  const disabledDates = getDisabledDates(disabledRanges);

  return (
    <div className="flex flex-col mx-auto w-full">
      <style jsx global>{`
        .rdrDateRangePickerWrapper {
          width: 100% !important;
          max-width: 100% !important;
        }
        .rdrCalendarWrapper {
          width: 100% !important;
          max-width: 100% !important;
        }
        .rdrMonth {
          width: 100% !important;
          max-width: 100% !important;
        }
        .rdrMonthAndYearWrapper {
          padding: 0 8px !important;
        }
        .rdrMonthAndYearPickers {
          font-size: 14px !important;
        }
        .rdrWeekDays {
          padding: 0 8px !important;
        }
        .rdrWeekDay {
          font-size: 12px !important;
        }
        .rdrDays {
          padding: 0 8px !important;
        }
        .rdrDay {
          font-size: 12px !important;
          height: 32px !important;
          width: 32px !important;
        }
        @media (min-width: 640px) {
          .rdrMonthAndYearPickers {
            font-size: 16px !important;
          }
          .rdrWeekDay {
            font-size: 14px !important;
          }
          .rdrDay {
            font-size: 14px !important;
            height: 36px !important;
            width: 36px !important;
          }
        }
        @media (min-width: 768px) {
          .rdrDay {
            height: 40px !important;
            width: 40px !important;
          }
        }
      `}</style>
      <DateRangePicker
        ranges={[selectionRange]}
        minDate={today}
        rangeColors={["#FD5B61"]}
        onChange={handleSelect}
        disabledDates={disabledDates}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={1}
        direction="horizontal"
      />
    </div>
  );
}

export default DatePicker; 