import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');

function FinalizedCalendar() {

    const { accessToken } = useAuth();
    let navigate = useNavigate();
    let { calendarId } = useParams();
    const [calendar, setCalendar] = useState(null);

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

    


    const location = useLocation();
    const data = location.state ? location.state.data : [];

  return (
    <>
    <Sidebar/>
        <div className='p-8 sm:ml-64'>
            <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
                <h1 className="text-2xl md:text-4xl">Calendar Name</h1>
                <span class="inline-flex align-middle items-center bg-green-100 text-green-800 text-xs font-medium ml-2.5 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                <span class="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                Finalized
                </span>
            </div>
            <ScheduleComponent eventSettings={{
                dataSource: data, 
            }}
            // selectedDate={'date'}  --> This is for if we don't want the calendar to open on today's date
            currentView='Month'
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
    <Footer />
    </>
    );
}

export default FinalizedCalendar;
