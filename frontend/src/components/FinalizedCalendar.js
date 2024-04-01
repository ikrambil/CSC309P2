import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');

const FinalizedCalendar = () => {

    const { accessToken } = useAuth();
    let navigate = useNavigate();
    let { calendarId } = useParams();
    const [calendar, setCalendar] = useState(null);

    console.log("CalendarId: ", calendarId);

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
                navigate('/dashboard/');
            }
        };

        fetchCalendarDetails();
    }, [calendarId]);

    if (!calendar) {
        return <div>Loading...</div>;
        }

    console.log("Calendar info: ", calendar);
    console.log("final: ", typeof calendar.finalized_schedule);

    const finalizedString = calendar.finalized_schedule.replace(/'/g, '"');
    console.log("Finalized String: ",finalizedString);

    const finalizedSchedule = JSON.parse(finalizedString);

    console.log("Finalized Info: ", finalizedSchedule);
    console.log("Final type: ", typeof finalizedSchedule);
;

  return (
    <>
    <Sidebar />
      <div className='p-8 sm:ml-64'>
        <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
            <h1 className="text-2xl md:text-4xl">Finalized Calendar:</h1>
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
            <div className='flex flex-col items-center'>
            <ScheduleComponent
                eventSettings={{
                    dataSource: finalizedSchedule.flatMap((event, eventIndex) =>
                        event.meeting_times.map((slot, index) => ({
                            Id: `${eventIndex}-${index + 1}`,
                            Subject: event.invitee,
                            StartTime: new Date(slot),
                            EndTime: new Date(event.meeting_times[index + 1]),
                        }))
                    ).reduce((acc, val) => acc.concat(val), []),
                }}
            
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
                        
            </div>
        </div>
    </div>
    <Footer />
    </>
    );
}

export default FinalizedCalendar;
