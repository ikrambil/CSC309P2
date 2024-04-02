import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');


const ViewCalendar = () => {
    const { accessToken } = useAuth();
    let navigate = useNavigate();
    let { calendarId } = useParams(); // Assuming you're passing the calendar ID in the route
    const [calendar, setCalendar] = useState(null);

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

        if (typeof data.requests === 'string') {
          try {
            data.requests = JSON.parse(data.requests);
          } catch (error) {
            console.error('Error parsing requests:', error);
            // Handle parsing error (e.g., set requests to an empty array)
            data.requests = []; // Default to an empty array if parsing fails
          }
        }

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
    console.log(calendar.invitations);
    console.log(typeof calendar.invitations);
    const sendReminder = async (email, calendarId) => {
        const url = 'http://localhost:8000/calendars/send-reminder/';
        const data = {
          email: email,
          calendar_id: calendarId
        };
      
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`, 
            },
            body: JSON.stringify(data),
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const responseData = await response.json();
          console.log(responseData.message);
          alert(`Reminder sent to ${email}.`); // You can replace this with a more user-friendly notification
        } catch (error) {
          console.error('Failed to send reminder:', error);
          alert('Failed to send reminder.'); // You can replace this with a more user-friendly notification
        }
      };
      
      const acceptRequest = async (reqEmail, calendarId) => {
        const url = `http://localhost:8000/calendars/accept/${calendarId}/`;
        const data = {
          calendar_id: calendarId,
          email: reqEmail
        };
      
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`, 
            },
            body: JSON.stringify(data),
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const responseData = await response.json();
          console.log(responseData.message);
          alert(`Notification sent to ${reqEmail}.`); // You can replace this with a more user-friendly notification
        } catch (error) {
          console.error('Failed to send notification:', error);
          alert('Failed to send notification.'); // You can replace this with a more user-friendly notification
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
    

    const getCalendarStatusText = ({ pending, accepted, finalized }) => {
      const totalInvitations = parseInt(pending, 10) + parseInt(accepted, 10);
      
      if (finalized) {
        return 'Finalized';
      } else if (totalInvitations === parseInt(accepted, 10)) {
        return 'Waiting to Finalize';
      } else {
        return 'Waiting for Recipients';
      }
    };

    const calendarStatusText = getCalendarStatusText({
      pending: calendar.pendingInvitationsCount,
      accepted: calendar.acceptedInvitationsCount,
      finalized: calendar.finalized
    });

    let selectedDate = null;
    if (events.length > 0) {
      selectedDate = new Date(events[0].StartTime);
    }


  return (
    <>
      <Sidebar />
      <div className='p-8 sm:ml-64'>
        <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
            <h1 className="text-2xl md:text-4xl">View Your Calendar:</h1>
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
              selectedDate={selectedDate}
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
        
        <div className="mb-6">
            <div className="text-left w-full border-b p-4 flex justify-center mb-4 items-center text-center">
                <h1 className="text-xl md:text-2xl text-center">Invitations:</h1>
            </div>
            <ul className='max-w-sm divide-y divide-gray-200 dark:divide-gray-700 mr-auto p-8 pt-0'>
                {calendar.invitations.map((invitation, index) => (
                <li key={index} className="py-3 sm:py-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                        {invitation.invitee_email}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        {invitation.status === "Pending" ? (
                        <>
                            <span
                            className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                            <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                            Not Confirmed
                            </span>
                            <span
                            className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            <span className="w-2 h-2 mr-1 bg-blue-500 rounded-full"></span>
                            <button onClick={() => sendReminder(invitation.invitee_email, calendar.id)} className="underline">Send Reminder</button>
                            </span>
                        </>
                        ) : (
                        <span
                            className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                            <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                            Confirmed
                        </span>
                        )}
                    </div>
                    </div>
                </li>
                ))}
            </ul>
        </div>

        <div className="mb-6">
            <div className="text-left w-full border-b p-4 flex justify-center mb-4 items-center text-center">
                <h1 className="text-xl md:text-2xl text-center">Requests To Join:</h1>
            </div>
            <ul className='max-w-sm divide-y divide-gray-200 dark:divide-gray-700 mr-auto p-8 pt-0'>
                {Array.isArray(calendar.requests) && calendar.requests.map((req, index) => (
                <li key={index} className="py-3 sm:py-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                        {req}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                    <>
                            
                            <span
                            className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            <span className="w-2 h-2 mr-1 bg-blue-500 rounded-full"></span>
                            <button onClick={() => acceptRequest(req, calendar.id)} className="underline">Accept Request</button>
                            </span>
                        </>
                    </div>
                    </div>
                </li>
                ))}
            </ul>
        </div>

        <button
          onClick={() => {
            if (calendarStatusText === 'Finalized') {
              navigate(`/finalizedCalendar/${calendarId}`);
            } else if (calendarStatusText === 'Waiting to Finalize') {
              navigate(`/recommendedCalendars/${calendarId}`);
            } else {
              navigate(`/edit-calendar/${calendarId}`);
            }
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {calendarStatusText === 'Finalized' ? 'View Calendar' : calendarStatusText === 'Waiting to Finalize' ? 'See Recommended Calendars' : 'Edit'}
        </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewCalendar;
