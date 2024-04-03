import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import AvailabilityPicker from './Availibility';
import {format, parseISO, startOfDay, subHours } from 'date-fns';


const AddInvite = () => {
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calendar, setCalendar] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); 
  const { accessToken } = useAuth(); 
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if at least one toggle is selected
    const isAnyDateActive = Object.values(selectedDates).some(date => date.active);
    setIsSubmitDisabled(!isAnyDateActive); // Enable submit if any date is active
  }, [selectedDates]); // Re-run check when selectedDates changes


  useEffect(() => {
    if (token) {
      fetchInvitationDetails(token);
    }
  }, [token, accessToken]); // accessToken added if it's used in the future

  useEffect(() => {
    // This ensures fetchCalendarDetails is called only after invitation is successfully fetched
    if (invitation) {
      fetchCalendarDetails(invitation.calendar); // Assuming invitation contains a calendar ID
    }
  }, [invitation, accessToken]); // Dependency on invitation

  const fetchInvitationDetails = async () => {
    const url = `http://localhost:8000/calendars/invitations/${token}/view/`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setInvitation(data);
       // console.log(data);
    } catch (error) {
        console.error('No Calendar exists', error);
        // Handle error
    } finally {
        //setIsLoading(false); // Ensure to set loading state to false regardless of the fetch outcome
    }
    };

    const fetchCalendarDetails = async (calendar_id) => {
        const url = `http://localhost:8000/calendars/${calendar_id}/`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': `Bearer ${accessToken}`,
                },
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setCalendar(data);
           // console.log(data);
        } catch (error) {
            console.error('No Calendar exists', error);
            // Handle error
            //navigate('/dashboard/')
        } finally {
            setIsLoading(false); // Ensure to set loading state to false regardless of the fetch outcome
        }
        };
    //console.log(invitation);
    //console.log(calendar);
    const [dateRange, setDateRange] = useState(null);
    useEffect(() => {
        if (calendar && calendar.availability) {
          const fixedDateRange = calendar.availability.reduce((acc, curr) => {
            const startTime = parseISO(curr.start_time);
            const endTime = parseISO(curr.end_time);
    
            if (!acc.start || startTime < parseISO(acc.start)) {
              acc.start = curr.start_time; // Keep track of the earliest start time
            }
            if (!acc.end || endTime > parseISO(acc.end)) {
              acc.end = curr.end_time; // Keep track of the latest end time
            }
    
            return acc;
          }, { start: null, end: null });
    
          setDateRange({
            start: format(parseISO(fixedDateRange.start), 'yyyy-MM-dd'),
            end: format(parseISO(fixedDateRange.end), 'yyyy-MM-dd')
          });
        }
      }, [calendar]);

    const handleSelectedDatesChange = (updatedSelectedDates) => {
    setSelectedDates(updatedSelectedDates);
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
    
        // Transform selectedDates into the expected format for your backend
        const availability = Object.entries(selectedDates)
      .filter(([_, value]) => value.active) // Filter for active dates
      .flatMap(([date, value]) => {
          if (Array.isArray(value.timeRanges)) {
              return value.timeRanges.map(({ startTime, endTime }) => {
                  // Check if startTime and endTime are strings before parsing
                  const startDateTime = typeof startTime === 'string' ? parseISO(startTime) : startTime;
                  const endDateTime = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
                  // Subtract 24 hours from the datetime objects to adjust for the timezone offset
                  const dateObj = startOfDay(parseISO(date));
                  const adjustedDateObj = subHours(dateObj, 24);
                  const adjustedDateString = format(adjustedDateObj, 'yyyy-MM-dd');
  
                  // Use the date part from the 'date' and time part from adjustedStartDateTime and adjustedEndDateTime
                  const formattedStartTime = format(new Date(`${adjustedDateString}T${format(startDateTime, 'HH:mm')}`), "yyyy-MM-dd'T'HH:mm");
                  const formattedEndTime = format(new Date(`${adjustedDateString}T${format(endDateTime, 'HH:mm')}`), "yyyy-MM-dd'T'HH:mm");
  
                  return {
                      start_time: formattedStartTime,
                      end_time: formattedEndTime,
                  };
              });
          }
          return [];
      });
    
        try {
          const response = await fetch(`http://localhost:8000/calendars/invitations/${token}/update/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                availability: JSON.stringify(availability), // Use the directly prepared data
              })
          });
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          // Handle response data or success state...
          console.log("Availability submitted successfully.");
          navigate(`/view-invite/${token}`);
        } catch (error) {
          console.error('Error submitting availability:', error);
          // Handle error state...
        }
      };

  if (isLoading) return (<div>Loading...</div>);

  return (
    <>
    <div className='p-8'>
      <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-left">
        <h1 className="text-2xl md:text-4xl">Welcome! You have been invited to {calendar.name}</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <div className='w-1/2'>

      <div className="mb-6">
            <div className="text-left w-full border-b p-4 flex justify-left mb-4 items-left">
                <h1 className="text-xl md:text-2xl">Description:</h1>
            </div>
            <div  className="block px-8 text-sm text-xl text-gray-900 ">{calendar.description} </div>
        </div>
        <div className="mb-6 flex-col justify-center">
            <div className="text-left w-full border-b p-4 flex justify-left mb-4 items-left">
            <h1 className="text-xl md:text-2xl">
                {invitation && invitation.availability && invitation.availability.length > 0 ? "Please put in your availability:": "Update your availability:"}
                </h1>

            </div>
            <AvailabilityPicker 
                setSelectedDates={handleSelectedDatesChange} 
                isRangeFixed={true} 
                fixedDateRange={dateRange} 
                />
            {isSubmitDisabled && (
          <div className=" w-full text-center text-sm font-medium text-bold text-red-700 bg-red-300 rounded-lg">Please select at least one date.</div>
        )}
        </div>
        
      </div>
      <button disabled={isSubmitDisabled} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-8">Submit!</button>
      {invitation && invitation.availability && invitation.availability.length > 0 ? (<Link to={`/view-invite/${token}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">View Availability!</Link>):(<></>)} 
    </form>
    </div>
    <Footer/>
    </>
  );
};

export default AddInvite;
