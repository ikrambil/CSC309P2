import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';


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
    console.log(calendar);
    console.log(typeof calendar.availability);
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
            <div>
                {(calendar.availability || []).map((slot, index) => (
                    <div key={index} className="px-8 text-sm text-xl text-gray-900 mb-2">
                        <div>Start: {new Date(slot.start_time).toLocaleString()}</div>
                        <div>End: {new Date(slot.end_time).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
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
        <button
          onClick={() => navigate(`/edit-calendar/${calendarId}`)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Edit
        </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewCalendar;
