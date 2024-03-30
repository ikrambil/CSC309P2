import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Footer from './Footer'; // Assuming you have a Footer component
import 'flowbite';
import { AuthProvider } from '../context/AuthContext.js';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');

function FinalizedCalendar() {

    /*const location = useLocation();
    const navigate = useNavigate();
    const calendarId = 1; // Replace this with the actual calendar ID
    const data = location.state ? location.state.data : [];

    const finalizeCalendar = () => {
        axios.post(`/calendars/${calendarId}/finalize/`, { finalized_schedule: data })
            .then(response => {
                console.log(response.data.message);
                navigate('/'); // Navigate to the desired page after successful finalization
            })
            .catch(error => {
                console.error('There was an error finalizing the calendar:', error);
            });
    };

    useEffect(() => {
        finalizeCalendar();
    }, []);*/

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
