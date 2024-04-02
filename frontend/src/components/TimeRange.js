import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setHours, setMinutes, addMinutes } from 'date-fns';

const TimeRangePicker = ({ onTimeChange }) => {
  // Initialize the first time range from 9 AM to 5 PM
  const initialStartTime = setHours(setMinutes(new Date(), 0), 9);
  const initialEndTime = setHours(setMinutes(new Date(), 0), 17);

  const [timeRanges, setTimeRanges] = useState([
    { startTime: initialStartTime, endTime: initialEndTime }
  ]);
  useEffect(() => {
    onTimeChange(timeRanges);
  }, [timeRanges]); 

  const addTimeRange = () => {
    const lastTimeRange = timeRanges[timeRanges.length - 1];
    // Assumes new time ranges are 30 minutes after the last end time.
    const newStartTime = lastTimeRange.endTime;
    const newEndTime = addMinutes(newStartTime, 30);
    setTimeRanges([
      ...timeRanges,
      { startTime: newStartTime, endTime: newEndTime }
    ]);
    onTimeChange([
      ...timeRanges,
      { startTime: newStartTime, endTime: newEndTime }
    ]);
  };

  const handleTimeChange = (index, time, isStartTime) => {
    const updatedTimeRanges = [...timeRanges];
    updatedTimeRanges[index] = {
      ...updatedTimeRanges[index],
      [isStartTime ? 'startTime' : 'endTime']: time
    };
    setTimeRanges(updatedTimeRanges);
    onTimeChange(updatedTimeRanges);
  };
  
  const deleteTimeRange = (index) => {
    const updatedTimeRanges = timeRanges.filter((_, i) => i !== index);
    setTimeRanges(updatedTimeRanges);
    onTimeChange(updatedTimeRanges);
  };
  //console.log(timeRanges)
  return (
    <div>
      {timeRanges.map((range, index) => (
        <div key={index} className="flex items-center">
          <DatePicker
            selected={range.startTime}
            onChange={(time) => handleTimeChange(index, time, true)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="Start"
            dateFormat="h:mm a"
            className="form-timepicker rounded-lg text-m w-24 h-8"
          />
          <span className="mx-2">-</span>
          <DatePicker
            selected={range.endTime}
            onChange={(time) => handleTimeChange(index, time, false)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="End"
            dateFormat="h:mm a"
            className="form-timepicker rounded-lg text-m w-24 h-8"
          />
          <button onClick={addTimeRange} className="whitespace-nowrap items-center text-sm font-medium relative rounded-md transition disabled:cursor-not-allowed flex justify-center hover:bg-gray-100 focus-visible:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-empthasis disabled:border-subtle disabled:bg-opacity-30 disabled:text-muted disabled:hover:bg-transparent disabled:hover:text-muted disabled:hover:border-subtle h-9 px-4 py-2.5 min-h-[36px] min-w-[36px] !p-2 hover:border-default text-default" type="button" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg></button>
          {index > 0 && ( // Only render the delete button for time ranges after the first
            <button onClick={() => deleteTimeRange(index)} className="whitespace-nowrap items-center text-sm font-medium relative rounded-md transition disabled:cursor-not-allowed flex justify-center border border-default hover:bg-red-100 hover:text-red-600 focus-visible:text-red-700 focus-visible:border-red-100 hover:bg-error focus-visible:bg-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:bg-red-100 disabled:border-red-200 disabled:text-red-700 disabled:hover:border-red-200 disabled:opacity-40 h-9 px-4 py-2.5 min-h-[36px] min-w-[36px] !p-2 hover:border-default text-default  border-none" tooltip="Delete" type="button" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
          )}
        </div>
      ))}
      
    </div>
  );
};

export default TimeRangePicker;



