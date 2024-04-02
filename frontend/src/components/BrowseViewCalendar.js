import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');


const BrowseViewCalendar = () => {
    const { accessToken, userEmail, userName } = useAuth();
    console.log(userName)
    let navigate = useNavigate();
    let { calendarId } = useParams(); // Assuming you're passing the calendar ID in the route
    const [calendar, setCalendar] = useState(null);
    const [isRequested, setIsRequested] = useState(false);

    useEffect(() => {
    // Placeholder for API call to fetch calendar details
    const fetchCalendarDetails = async () => {
    const url = `http://localhost:8000/calendars/${calendarId}/`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCalendar(data)
    } catch (error) {
        console.error('No Calendar exists', error);
        // Handle error
        navigate('/dashboard/')
    }
    };

    fetchCalendarDetails();
    }, [calendarId]);

    if (!calendar) {
    return <div>Loading...</div>;
    }

    const sendRequest = async () => {
      const url = `http://localhost:8000/calendars/request/${calendarId}/`;
      const data = {
        calendar_id: calendarId,
        email: userEmail,
        
      };
      console.log(data)
    
      try {
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const responseData = await response.json();
        console.log(responseData.message);
        setIsRequested(true);
        alert(`Request sent to calendar owner`); // You can replace this with a more user-friendly notification
      } catch (error) {
        console.error('Failed to send request:', error);
        alert('Failed to send request.'); // You can replace this with a more user-friendly notification
      }
    };

      const events = (calendar.availability || []).map((slot, index) => {
        return {
            Id: index + 1, // Assigning unique IDs to each event
            Subject: 'Availability', // You can customize the subject if needed
            StartTime: new Date(slot.start_time),
            EndTime: new Date(slot.end_time)
        };
    });


  return (
    <>
      <Sidebar />
      <div className='p-8 sm:ml-64'>
        <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
            <h1 className="text-2xl md:text-4xl">Check out this Event!</h1>
        </div>
        <div className='flex flex-col items-center'>
        <div className="mb-6">
            <div className="text-left w-full border-b p-4 flex justify-center mb-4 items-center">
                <h1 className="text-xl md:text-2xl">Name:</h1>
            </div>
            <div htmlFor="calendarName" className="block px-8 text-sm text-xl text-gray-900 ">{calendar.name} </div>
        </div>
        <div className="mb-6">
            <div className="text-left w-full border-b p-4 flex justify-center mb-4 items-center">
                <h1 className="text-xl md:text-2xl">Description:</h1>
            </div>
            <div htmlFor="calendarName" className="block px-8 text-sm text-xl text-gray-900 ">{calendar.description} </div>
        </div>
        <div className="mb-6">
            <div className="text-left w-full border-b p-4 flex justify-center mb-4 items-center">
                <h1 className="text-xl md:text-2xl">Availability:</h1>
            </div>
          </div>
            <ScheduleComponent eventSettings={{ 
              dataSource: events 
              }} 
              currentView='Month'
              readonly={true}
              >
              <ViewsDirective>
                  <ViewDirective option="Day" />
                  <ViewDirective option="Week" />
                  <ViewDirective option="Month" />
                  <ViewDirective option="Year" />
                  <ViewDirective option="Agenda" />
              </ViewsDirective>
              <Inject services={[Day, Week, Month, Year, Agenda]} />
            </ScheduleComponent>
        
        <button disabled={isRequested}
          onClick={() => sendRequest()}
          className="mt-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {isRequested ? 'Request Sent' : 'Send Request To Join'}
        </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BrowseViewCalendar;
