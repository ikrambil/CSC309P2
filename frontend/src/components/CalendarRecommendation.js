import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');


const CalendarRecommendation = () => {
    const { accessToken } = useAuth();
    let navigate = useNavigate();
    let { calendarId } = useParams(); // Assuming you're passing the calendar ID in the route
    const [calendar, setCalendar] = useState(null);
    const [calendar1, setCalendar1] = useState(null);
    const [calendar2, setCalendar2] = useState(null);
    const [calendar3, setCalendar3] = useState(null);
    const [selectedOption, setSelectedOption] = useState(calendar1); // or any other default option

    useEffect(() => {
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
                setCalendar(data);
            } catch (error) {
                console.error('No Calendar exists', error);
                navigate('/dashboard/');
            }
        };

        fetchCalendarDetails();
    }, [calendarId, accessToken, navigate]);

    //console.log(calendar);

    useEffect(() => {
        
        const fetchCalendarDetails = async () => {
            const url = `http://localhost:8000/calendars/${calendarId}/recommendations/`;
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
                setCalendar1(data[0]);
                setCalendar2(data[1]);
                setCalendar3(data[2]);
                if (data && data.length > 0) {
                    setSelectedOption(data[0]); // Set selectedOption to the first combination
                }
            } catch (error) {
                console.error('No Calendar exists', error);
                navigate('/dashboard/')
            }
        };
    
        fetchCalendarDetails();
    }, [calendarId]);
    
    if (!calendar) {
        return <div>Loading...</div>;
    }

    if (!calendar1) {
    return <div>Loading...</div>;
    }

    /*console.log(calendar1);
    console.log(calendar2);
    console.log(calendar3);
    console.log(selectedOption);*/

    const finalizeCalendar = async (calendarId, accessToken, selectedOption, navigate) => {
        const url = `http://localhost:8000/calendars/${calendarId}/finalize/`;
        const requestdata = JSON.stringify({ selectedOption });
        //console.log("Request Data: ", requestdata)
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ finalized_schedule: selectedOption }),
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
            // Assuming successful finalization
            //navigate(`/finalizedCalendar/${calendarId}`, { state: { data: selectedOption } });
        } catch (error) {
            console.error('Error finalizing calendar', error);
            // Handle error accordingly
        }
    };

    const sendConfirmation = async (email, calendarId, date, startTime, endTime) => {
        const url = 'http://localhost:8000/calendars/send-confirmation/';
        console.log('Calendar Id: ', calendarId);
        const data = {
            email: email, 
            calendar_id: calendarId,
            date: date,
            start_time: startTime,
            end_time: endTime
        };

        try{
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(data),
            });

            if(!response.ok){
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log(responseData.message);
            alert(`Confirmation sent to ${email}.`);
        }
        catch(error){
            console.error('Failed to send confirmation: ', error);
            alert('Failed to send confirmation.');
        }
    };

    const finalizeAndSendConfirmation = async () => {
        try {
            await finalizeCalendar(calendarId, accessToken, selectedOption, navigate);
            const processedMeetings = new Set(); // Set to keep track of processed meetings
            selectedOption.forEach(event => {
                for (let i = 0; i < event.meeting_times.length; i += 2) {
                    const startTime = event.meeting_times[i];
                    const endTime = event.meeting_times[i + 1];
                    const invitee = event.invitee;
                    const date = new Date(startTime).toLocaleDateString();
                    sendConfirmation(invitee, calendarId, date, startTime, endTime);
                    processedMeetings.add(startTime); // Add meeting to processed set
                }
            });
            // Navigate after finalizing and sending confirmation
            navigate(`/finalizedCalendar/${calendarId}`, { state: { data: selectedOption } });
        } catch (error) {
            console.error('Error finalizing calendar and sending confirmation', error);
            // Handle error accordingly
        }
    };
    
    
    const getButtonClass = (option) => {
        return selectedOption === option ? 'bg-blue-700 text-white' : 'bg-gray-200 text-black';
    };

    let selectedDate = null;
    if (selectedOption.length > 0 && selectedOption[0].meeting_times.length > 0) {
        selectedDate = new Date(selectedOption[0].meeting_times[0]);
    }

    if (selectedOption && selectedOption.some(event => event.meeting_times === "No available time slot")) {
        return (
        <>
        <Sidebar />
            <div className='p-8 sm:ml-64'>
                <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
                    <h1 className="text-2xl md:text-4xl">Choose a Calendar:</h1>
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
                <div className="text-center text-red-500 text-xl">No Possible calendars. Please increase your availability or contact your invitees to increase their availability.</div>
                <div className="flex justify-center">
                <button className="mt-4 p-2 rounded bg-blue-700 text-white" onClick={() => {navigate(`/edit-calendar/${calendarId}`)}}>Edit Availability</button>
                </div>
                </div>
            </div>
        <Footer />
        </>
    );
    }

    return (
        <>
        <Sidebar />
            <div className='p-8 sm:ml-64'>
                <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
                    <h1 className="text-2xl md:text-4xl">Choose a Calendar:</h1>
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
                <div className="flex justify-center mb-4">
                    {/* Button for each option */}
                    <button className={`mr-2 p-2 rounded ${getButtonClass(calendar1)}`} onClick={() => setSelectedOption(calendar1)}>Option 1</button>
                    <button className={`mr-2 p-2 rounded ${getButtonClass(calendar2)}`} onClick={() => setSelectedOption(calendar2)}>Option 2</button>
                    <button className={`mr-2 p-2 rounded ${getButtonClass(calendar3)}`} onClick={() => setSelectedOption(calendar3)}>Option 3</button>
                </div>

                {/* Syncfusion Scheduler */}
                {selectedOption && (
                    <ScheduleComponent eventSettings={{
                        dataSource: selectedOption.flatMap((event, eventIndex) => (
                            event.meeting_times.map((slot, index) => ({
                                Id: `${eventIndex}-${index + 1}`,
                                Subject: event.invitee,
                                StartTime: new Date(slot),
                                EndTime: new Date(event.meeting_times[index + 1]) // Assuming meeting_times is always in pairs
                            }))
                        ))
                    }}
                    readonly={true}
                    selectedDate={selectedDate}
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
                )}
                <div className="flex justify-center">
                <button className="mt-4 p-2 rounded bg-blue-700 text-white" onClick={finalizeAndSendConfirmation}>Finalize</button>
                </div>
            </div>
            </div>
            <Footer />
        </>
    );

}

export default CalendarRecommendation;
    