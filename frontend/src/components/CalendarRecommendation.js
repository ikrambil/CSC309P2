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

    console.log(calendar);

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
    

    if (!calendar1) {
    return <div>Loading...</div>;
    }

    console.log(calendar1);
    console.log(calendar2);
    console.log(calendar3);
    console.log(selectedOption);
    

    const finalizeCalendar = () => {
        // Assuming you have a route for finalizing calendar
        navigate(`/finalizedCalendar/${calendarId}`, { state: { data: selectedOption[0] } });
    };

    const getButtonClass = (option) => {
        return selectedOption === option ? 'bg-blue-700 text-white' : 'bg-gray-200 text-black';
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
                    }} currentView='Month'
                    readonly={true}>
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
                    <button className="mt-4 p-2 rounded bg-blue-700 text-white" onClick={finalizeCalendar}>Finalize</button>
                </div>
            </div>
            </div>
            <Footer />
        </>
    );

}

export default CalendarRecommendation;
    